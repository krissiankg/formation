import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as cwActions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import type { ForgeiaBaseStack } from "./base-stack";

export interface ForgeiaWebStackProps extends cdk.StackProps {
  base: ForgeiaBaseStack;
  imageTag: string;
  /** Certificat ACM en us-east-1 couvrant tous les domaineNames. */
  certificateArn: string;
  domainNames: string[];
  redirectLegacyDomains?: boolean;
}

// Clés du secret forgeia/web/env injectées dans le conteneur (toutes doivent exister dans le JSON).
const ENV_SECRET_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_INTERNAL_URL",
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHAT_ID",
  "FEDAPAY_SECRET_KEY",
  "FEDAPAY_ENV",
  "FEDAPAY_WEBHOOK_SECRET",
  "EVOLUTION_API_URL",
  "EVOLUTION_API_INSTANCE",
  "EVOLUTION_API_KEY",
  "ADMIN_WHATSAPP",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD_HASH",
  "ADMIN_SESSION_SECRET",
  "PROMO_CODES",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "GOOGLE_DRIVE_FOLDER_ID",
  "GOOGLE_REFRESH_TOKEN",
  "SUPABASE_GATE_TOKEN",
];

const ORIGIN_VERIFY_HEADER = "X-Origin-Verify";
const CONTAINER_PORT = 3000;

/**
 * Application Next.js : ECS Fargate (sous-réseaux publics, sans NAT) derrière un ALB
 * accessible uniquement depuis CloudFront ; /uploads/* servi depuis S3.
 */
export class ForgeiaWebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ForgeiaWebStackProps) {
    super(scope, id, props);
    const { base } = props;

    const vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: "forgeia-vpc",
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [{ name: "public", subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 }],
    });

    const uploadsBucket = new s3.Bucket(this, "UploadsBucket", {
      bucketName: `forgeia-uploads-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.PUT],
          allowedOrigins: props.domainNames.map((d) => `https://${d}`),
          allowedHeaders: ["*"],
          exposedHeaders: ["ETag"],
          maxAge: 3600,
        },
      ],
    });

    // --- ECS Fargate ---
    const cluster = new ecs.Cluster(this, "Cluster", { vpc, clusterName: "forgeia" });

    const logGroup = new logs.LogGroup(this, "WebLogs", {
      logGroupName: "/forgeia/web",
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const taskDef = new ecs.FargateTaskDefinition(this, "WebTask", {
      family: "forgeia-web",
      cpu: 256,
      memoryLimitMiB: 1024,
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX,
      },
    });

    taskDef.addContainer("web", {
      image: ecs.ContainerImage.fromEcrRepository(base.repository, props.imageTag),
      portMappings: [{ containerPort: CONTAINER_PORT }],
      logging: ecs.LogDrivers.awsLogs({ logGroup, streamPrefix: "web" }),
      environment: {
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_URL: "https://www.forgeia.site",
        LEGACY_DOMAIN_REDIRECTS: props.redirectLegacyDomains ? "true" : "false",
        UPLOADS_BUCKET: uploadsBucket.bucketName,
        AWS_REGION: this.region,
      },
      secrets: Object.fromEntries(
        ENV_SECRET_KEYS.map((key) => [key, ecs.Secret.fromSecretsManager(base.envSecret, key)]),
      ),
    });
    uploadsBucket.grantPut(taskDef.taskRole, "uploads/resources/*");

    const serviceSg = new ec2.SecurityGroup(this, "ServiceSg", {
      vpc,
      description: "FORGE IA conteneurs - trafic depuis l ALB uniquement",
    });

    const service = new ecs.FargateService(this, "WebService", {
      serviceName: "forgeia-web",
      cluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      assignPublicIp: true,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      securityGroups: [serviceSg],
      minHealthyPercent: 100,
      maxHealthyPercent: 200,
      circuitBreaker: { enable: true, rollback: true },
      healthCheckGracePeriod: cdk.Duration.seconds(60),
    });

    // --- ALB, ouvert uniquement aux serveurs d'origine CloudFront ---
    const cloudFrontPrefixList = ec2.PrefixList.fromLookup(this, "CloudFrontPrefixList", {
      prefixListName: "com.amazonaws.global.cloudfront.origin-facing",
    });
    const albSg = new ec2.SecurityGroup(this, "AlbSg", {
      vpc,
      description: "FORGE IA ALB - HTTP depuis CloudFront uniquement",
      allowAllOutbound: true,
    });
    albSg.addIngressRule(ec2.Peer.prefixList(cloudFrontPrefixList.prefixListId), ec2.Port.tcp(80));
    serviceSg.addIngressRule(albSg, ec2.Port.tcp(CONTAINER_PORT));

    const alb = new elbv2.ApplicationLoadBalancer(this, "Alb", {
      loadBalancerName: "forgeia-alb",
      vpc,
      internetFacing: true,
      securityGroup: albSg,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
    });

    const targetGroup = new elbv2.ApplicationTargetGroup(this, "WebTargets", {
      vpc,
      port: CONTAINER_PORT,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targetType: elbv2.TargetType.IP,
      targets: [service],
      deregistrationDelay: cdk.Duration.seconds(30),
      healthCheck: { path: "/api/health", healthyHttpCodes: "200", interval: cdk.Duration.seconds(30) },
    });

    const originVerifyToken = base.originVerifySecret.secretValue.unsafeUnwrap();
    const listener = alb.addListener("Http", {
      port: 80,
      open: false,
      defaultAction: elbv2.ListenerAction.fixedResponse(403, {
        contentType: "text/plain",
        messageBody: "Forbidden",
      }),
    });
    listener.addAction("FromCloudFront", {
      priority: 1,
      conditions: [elbv2.ListenerCondition.httpHeader(ORIGIN_VERIFY_HEADER, [originVerifyToken])],
      action: elbv2.ListenerAction.forward([targetGroup]),
    });

    // --- CloudFront ---
    const albOrigin = new origins.LoadBalancerV2Origin(alb, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      customHeaders: { [ORIGIN_VERIFY_HEADER]: originVerifyToken },
      readTimeout: cdk.Duration.seconds(60),
    });
    const uploadsOrigin = origins.S3BucketOrigin.withOriginAccessControl(uploadsBucket);

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      comment: "FORGE IA",
      domainNames: props.domainNames,
      certificate: acm.Certificate.fromCertificateArn(this, "Certificate", props.certificateArn),
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      defaultBehavior: {
        origin: albOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_AND_CLOUDFRONT_2022,
        compress: true,
      },
      additionalBehaviors: {
        "/_next/static/*": {
          origin: albOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
        },
        "/uploads/*": {
          origin: uploadsOrigin,
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        },
      },
    });

    // --- Alarmes → e-mail ---
    const alarmAction = new cwActions.SnsAction(base.alertTopic);
    new cloudwatch.Alarm(this, "UnhealthyTargetsAlarm", {
      alarmName: "forgeia-web-unhealthy",
      alarmDescription: "Aucune instance saine de l application FORGE IA",
      metric: targetGroup.metrics.healthyHostCount({ period: cdk.Duration.minutes(1) }),
      threshold: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_THRESHOLD,
      evaluationPeriods: 3,
      treatMissingData: cloudwatch.TreatMissingData.BREACHING,
    }).addAlarmAction(alarmAction);
    new cloudwatch.Alarm(this, "Target5xxAlarm", {
      alarmName: "forgeia-web-5xx",
      alarmDescription: "Erreurs serveur repetees sur l application FORGE IA",
      metric: targetGroup.metrics.httpCodeTarget(elbv2.HttpCodeTarget.TARGET_5XX_COUNT, {
        period: cdk.Duration.minutes(5),
      }),
      threshold: 10,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }).addAlarmAction(alarmAction);

    new cdk.CfnOutput(this, "DistributionDomainName", { value: distribution.distributionDomainName });
    new cdk.CfnOutput(this, "UploadsBucketName", { value: uploadsBucket.bucketName });
    new cdk.CfnOutput(this, "LoadBalancerDns", { value: alb.loadBalancerDnsName });
  }
}

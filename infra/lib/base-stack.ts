import * as cdk from "aws-cdk-lib";
import * as budgets from "aws-cdk-lib/aws-budgets";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";

export interface ForgeiaBaseStackProps extends cdk.StackProps {
  alertEmail: string;
}

/**
 * Ressources durables créées avant l'application : registre d'images, secrets,
 * alertes e-mail et budget mensuel.
 */
export class ForgeiaBaseStack extends cdk.Stack {
  readonly repository: ecr.Repository;
  readonly envSecret: secretsmanager.Secret;
  readonly originVerifySecret: secretsmanager.Secret;
  readonly alertTopic: sns.Topic;

  constructor(scope: Construct, id: string, props: ForgeiaBaseStackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, "WebRepository", {
      repositoryName: "forgeia-web",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [{ maxImageCount: 10, description: "Garder les 10 dernieres images" }],
    });

    // Variables d'environnement de l'application (JSON clé → valeur), remplies hors CDK.
    this.envSecret = new secretsmanager.Secret(this, "WebEnvSecret", {
      secretName: "forgeia/web/env",
      description: "Variables d environnement de l application FORGE IA",
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Jeton partagé CloudFront → ALB : seules les requêtes passées par CloudFront sont servies.
    this.originVerifySecret = new secretsmanager.Secret(this, "OriginVerifySecret", {
      secretName: "forgeia/origin-verify",
      description: "En-tete secret ajoute par CloudFront et verifie par l ALB",
      generateSecretString: { excludePunctuation: true, passwordLength: 48 },
    });

    this.alertTopic = new sns.Topic(this, "AlertTopic", {
      topicName: "forgeia-alerts",
      displayName: "FORGE IA alertes",
    });
    this.alertTopic.addSubscription(new subs.EmailSubscription(props.alertEmail));

    new budgets.CfnBudget(this, "MonthlyBudget", {
      budget: {
        budgetName: "forgeia-monthly",
        budgetType: "COST",
        timeUnit: "MONTHLY",
        budgetLimit: { amount: 50, unit: "USD" },
      },
      notificationsWithSubscribers: [
        {
          notification: {
            notificationType: "ACTUAL",
            comparisonOperator: "GREATER_THAN",
            threshold: 80,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [{ subscriptionType: "EMAIL", address: props.alertEmail }],
        },
        {
          notification: {
            notificationType: "FORECASTED",
            comparisonOperator: "GREATER_THAN",
            threshold: 100,
            thresholdType: "PERCENTAGE",
          },
          subscribers: [{ subscriptionType: "EMAIL", address: props.alertEmail }],
        },
      ],
    });

    new cdk.CfnOutput(this, "RepositoryUri", { value: this.repository.repositoryUri });
  }
}

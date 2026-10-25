import * as cdk from "aws-cdk-lib";
import { ForgeiaBaseStack } from "../lib/base-stack";
import { ForgeiaWebStack } from "../lib/web-stack";

const app = new cdk.App();
const env = {
  account: app.node.tryGetContext("account") as string,
  region: app.node.tryGetContext("region") as string,
};
const domainNames = app.node.tryGetContext("domainNames") as string[];

cdk.Tags.of(app).add("project", "forgeia");

const base = new ForgeiaBaseStack(app, "ForgeiaBaseStack", {
  env,
  alertEmail: app.node.tryGetContext("alertEmail") as string,
  githubOidcSubjectPrefix: app.node.tryGetContext("githubOidcSubjectPrefix") as string,
});

// Le stack web n'est synthétisé que lorsque l'image et le certificat existent.
const imageTag = app.node.tryGetContext("imageTag") as string | undefined;
const certificateArn = app.node.tryGetContext("certificateArn") as string | undefined;

if (imageTag && certificateArn) {
  new ForgeiaWebStack(app, "ForgeiaWebStack", {
    env,
    base,
    imageTag,
    certificateArn,
    domainNames,
    redirectLegacyDomains: app.node.tryGetContext("redirectLegacyDomains") === true,
  });
}

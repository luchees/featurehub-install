import { App } from "@aws-cdk/core";
import { FeatureHubDatabaseStack } from "../lib/db-stack";
import { FeaturehubFargateStack } from "../lib/fargate-stack";
import { FeatureHubSecretsStack } from "../lib/secrets-stack";
import { VpcStack } from "../lib/vpc-stack";

const app = new App();

const prefix = "AllInOne";
const stage = "dev";

const vpcStack = new VpcStack(app, `${prefix}-featurehub-vpc-${stage}`, {
  stage,
});

const secretsStack = new FeatureHubSecretsStack(
  app,
  `${prefix}-featurehub-secrets-${stage}`,
  {
    description: "secrets stack for featurehub database",
    stage,
  }
);
const dbStack = new FeatureHubDatabaseStack(
  app,
  `${prefix}-featurehub-database-${stage}`,
  {
    description: "database stack for featurehub",

    stage,
    dbCredentials: secretsStack.dbCredentials,
    vpc: vpcStack.vpc,
  }
);
const fargateStack = new FeaturehubFargateStack(
  app,
  `${prefix}-featurehub-fargate-${stage}`,
  {
    description: "fargate stack for featurehub",
    stage,
    dbSecret: secretsStack.dbPasswordSecret,
    vpc: vpcStack.vpc,
    dbEndpoint: dbStack.database.dbInstanceEndpointAddress,
    dbPort: dbStack.database.dbInstanceEndpointPort,
  }
);

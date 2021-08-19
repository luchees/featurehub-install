import * as cdk from "@aws-cdk/core";
import * as rds from "@aws-cdk/aws-rds";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import { CONFIG } from "./config";

/**
 * Secrets Stack for creating the Secrets to be used with Featurehub Database
 */

interface ExtStackProps extends cdk.StackProps {
  stage: string;
  prefix?: string;
}

export class FeatureHubSecretsStack extends cdk.Stack {
  readonly dbPasswordSecret: secretsmanager.Secret;
  readonly dbCredentials: rds.Credentials;

  constructor(scope: cdk.Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);

    const prefix = props.prefix
      ? `${props.prefix}-${props.stage}`
      : props.stage;
    const config = CONFIG[props.stage];

    const dbPasswordSecret = new secretsmanager.Secret(
      this,
      "FeaturehubDbPassword",
      {
        secretName: `${prefix}-featurehub-db-password`,
        generateSecretString: {
          excludeCharacters: "%+~`#$&*()|[]{}:;<>?!/@ \\\"'", //password characters not supported by postgresql
        },
      }
    );
    // RDS Credentials to be used by RDS
    const dbCredentials = rds.Credentials.fromPassword(
      config.db.userName,
      dbPasswordSecret.secretValue
    );

    this.dbPasswordSecret = dbPasswordSecret;
    this.dbCredentials = dbCredentials;
  }
}

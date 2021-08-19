import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as rds from "@aws-cdk/aws-rds";
import { CONFIG } from "./config";

/**
 * Database Stack for deploying Postgres DB for featurehub
 */

interface ExtStackProps extends cdk.StackProps {
  stage: string;
  vpc: ec2.IVpc;
  dbCredentials: rds.Credentials;
  prefix?: string;
}

export class FeatureHubDatabaseStack extends cdk.Stack {
  readonly database: rds.DatabaseInstance;

  constructor(scope: cdk.Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);

    const prefix = props.prefix
      ? `${props.prefix}-${props.stage}`
      : props.stage;

    const config = CONFIG[props.stage];

    const database = new rds.DatabaseInstance(this, "FeaturehubDatabase", {
      databaseName: config.db.dbName,
      instanceIdentifier: `${prefix}-featurehub-db`,
      engine: rds.DatabaseInstanceEngine.postgres({
        version: config.db.version,
      }),
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      credentials: props.dbCredentials,
      instanceType: ec2.InstanceType.of(
        config.db.instanceClass,
        config.db.instanceSize
      ),
      vpc: props.vpc,
      vpcSubnets: {
        subnets: props.vpc.isolatedSubnets,
      },
    });
    database.connections.allowFrom(
      ec2.Peer.ipv4(props.vpc.vpcCidrBlock),
      new ec2.Port({
        protocol: ec2.Protocol.TCP,
        stringRepresentation: "Postgres Port",
        fromPort: 5432,
        toPort: 5432,
      }),
      "Allow Access to featureHub database port"
    );

    this.database = database;
  }
}

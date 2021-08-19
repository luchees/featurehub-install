import { SynthUtils } from "@aws-cdk/assert";
import { Vpc } from "@aws-cdk/aws-ec2";
import { Credentials } from "@aws-cdk/aws-rds";
import * as cdk from "@aws-cdk/core";
import * as Cdk from "../lib/db-stack";

describe("Featurehub db Stack", () => {
  test("snapshot", () => {
    const app = new cdk.App();

    const cdkStack = new cdk.Stack(app, "MyStack");
    const vpc = new Vpc(cdkStack, "MyVpc");

    const stack = new Cdk.FeatureHubDatabaseStack(app, "MyDbStack", {
      stage: "dev",
      vpc,
      dbCredentials: Credentials.fromPassword(
        "dbUser",
        cdk.SecretValue.plainText("password123")
      ),
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});

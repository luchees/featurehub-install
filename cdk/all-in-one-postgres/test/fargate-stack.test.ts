import { SynthUtils } from "@aws-cdk/assert";
import { Vpc } from "@aws-cdk/aws-ec2";
import { Secret } from "@aws-cdk/aws-secretsmanager";
import * as cdk from "@aws-cdk/core";
import * as Cdk from "../lib/fargate-stack";

describe("Featurehub fargate Stack", () => {
  test("snapshot", () => {
    const app = new cdk.App();
    const cdkStack = new cdk.Stack(app, "MyStack");
    const stack = new Cdk.FeaturehubFargateStack(app, "MyFargateStack", {
      stage: "dev",
      vpc: new Vpc(cdkStack, "MyVpc"),
      dbEndpoint: "featurehub.database.com",
      dbPort: "8099",
      dbSecret: new Secret(cdkStack, "MySecret"),
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});

import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import { VpcStack } from "../lib/vpc-stack";

describe("Featurehub vpc Stack", () => {
  test("snapshot", () => {
    const app = new cdk.App();
    const stack = new VpcStack(app, "MyTestVpcStack", {
      stage: "dev",
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});

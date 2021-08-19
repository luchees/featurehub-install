import { SynthUtils } from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as Cdk from "../lib/secrets-stack";

describe("Featurehub secrets Stack", () => {
  test("snapshot", () => {
    const app = new cdk.App();
    const stack = new Cdk.FeatureHubSecretsStack(app, "MySecretsStack", {
      stage: "dev",
    });
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
  });
});

import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

interface ExtStackProps extends cdk.StackProps {
  stage: string;
  prefix?: string;
}

export class VpcStack extends cdk.Stack {
  readonly vpc: ec2.Vpc;

  constructor(scope: cdk.Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);

    const prefix = props.prefix
      ? `${props.prefix}-${props.stage}`
      : props.stage;

    this.vpc = new ec2.Vpc(this, `${prefix}-VPC`);
  }
}

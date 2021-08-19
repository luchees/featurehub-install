import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as ecs from "@aws-cdk/aws-ecs";
import * as ecs_patterns from "@aws-cdk/aws-ecs-patterns";
import * as iam from "@aws-cdk/aws-iam";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";
import * as logs from "@aws-cdk/aws-logs";
import * as elb from "@aws-cdk/aws-elasticloadbalancingv2";
import { CONFIG } from "./config";

/**
 * Fargate Stack for deploying featurehub party-server
 */

interface ExtStackProps extends cdk.StackProps {
  stage: string;
  prefix?: string;
  vpc: ec2.IVpc;
  dbSecret: secretsmanager.Secret;
  dbEndpoint: string;
  dbPort: string;
}

export class FeaturehubFargateStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: ExtStackProps) {
    super(scope, id, props);

    const config = CONFIG[props.stage];

    const prefix = props.prefix
      ? `${props.prefix}-${props.stage}`
      : props.stage;

    const cluster = new ecs.Cluster(this, "featurehubEcsCluster", {
      vpc: props.vpc,
      clusterName: `${prefix}-featurehub-cluster`,
      containerInsights: true,
    });

    const executionRolePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ["*"],
      actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
    });

    const taskDef = new ecs.FargateTaskDefinition(this, "featurehubTaskDef", {
      family: `${prefix}-featurehub-taskdef`,
    });
    taskDef.addToExecutionRolePolicy(executionRolePolicy);
    const loadBalancer = new elb.ApplicationLoadBalancer(
      this,
      "featurehubLoadBalancer",
      {
        vpc: props.vpc,
        loadBalancerName: `${prefix}-featurehub-lb`,
        internetFacing: true,
      }
    );

    const container = taskDef.addContainer(`${prefix}-featurehub`, {
      image: ecs.ContainerImage.fromRegistry(
        `featurehub/party-server:${config.fargate.imageVersion}`
      ),
      logging: new ecs.AwsLogDriver({
        logGroup: new logs.LogGroup(this, "featurehubContainerLogGroup", {
          logGroupName: `/ecs/${prefix}-featurehub`,
        }),
        streamPrefix: `${prefix}-featurehub`,
      }),
      environment: {
        UID: "999",
        GID: "999",
        "DB.URL": `jdbc:postgresql://${props.dbEndpoint}:${props.dbPort}/${config.db.dbName}`,
        "DB.USERNAME": config.db.userName,
        "JERSEY.CORS.HEADERS":
          "X-Requested-With,Authorization,Content-type,Accept-Version,Content-MD5,CSRF-Token,x-ijt,cache-control,x-featurehub,Baggage",
        "REGISTER.URL": `http://${loadBalancer.loadBalancerDnsName}/register-url?token=%s`,
      },
      secrets: {
        "DB.PASSWORD": ecs.Secret.fromSecretsManager(props.dbSecret),
      },
    });

    container.addPortMappings({
      containerPort: 8085,
      protocol: ecs.Protocol.TCP,
    });

    const fargateService = new ecs_patterns.ApplicationLoadBalancedFargateService(
      this,
      "featurehubFargate",
      {
        serviceName: `${prefix}-featurehub-fargate`,
        cluster: cluster,
        platformVersion: ecs.FargatePlatformVersion.VERSION1_4,
        taskDefinition: taskDef,
        healthCheckGracePeriod: cdk.Duration.minutes(5),
        desiredCount: config.fargate.desiredCount,
        loadBalancer,
        cpu: config.fargate.cpu,
        memoryLimitMiB: config.fargate.memoryLimitMiB,
      }
    );

    fargateService.targetGroup.configureHealthCheck({
      enabled: true,
      path: "/metric/health/readyness",
      port: "8085",
      healthyHttpCodes: "200",
    });

    //Cookie stickiness needs to be enabled to make sure caching works
    fargateService.targetGroup.enableCookieStickiness(cdk.Duration.days(1));

    const scaling = fargateService.service.autoScaleTaskCount({
      maxCapacity: config.fargate.maxCapacity,
      minCapacity: config.fargate.minCapacity,
    });
    scaling.scaleOnCpuUtilization("featurehubCpuScaling", {
      policyName: `${prefix}-featurehub-cpu-scaling`,
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });
    scaling.scaleOnMemoryUtilization("featurehubMemScaling", {
      policyName: `${prefix}-featurehub-mem-scaling`,
      targetUtilizationPercent: 80,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });
  }
}

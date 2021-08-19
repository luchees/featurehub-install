import { InstanceClass, InstanceSize } from "@aws-cdk/aws-ec2";
import { PostgresEngineVersion } from "@aws-cdk/aws-rds";

interface FeaturehubConfig {
  [k: string]: {
    db: {
      dbName: string;
      userName: string;
      preferredMaintenanceWindow: string;
      version: PostgresEngineVersion;
      instanceClass: InstanceClass;
      instanceSize: InstanceSize;
    };
    fargate: {
      imageVersion: string;
      desiredCount: number;
      maxCapacity: number;
      minCapacity: number;
      cpu: number;
      memoryLimitMiB: number;
    };
  };
}

export const CONFIG: FeaturehubConfig = {
  dev: {
    db: {
      dbName: "featurehub",
      userName: "featurehub",
      preferredMaintenanceWindow: "Wed:10:00-Wed:11:00",
      version: PostgresEngineVersion.VER_13_3,
      instanceClass: InstanceClass.T3,
      instanceSize: InstanceSize.MEDIUM,
    },
    fargate: {
      imageVersion: "1.4.1",
      desiredCount: 2,
      maxCapacity: 8,
      minCapacity: 2,
      cpu: 256,
      memoryLimitMiB: 1024,
    },
  },
  staging: {
    db: {
      dbName: "featurehub",
      userName: "featurehub",
      preferredMaintenanceWindow: "Wed:10:00-Wed:11:00",
      version: PostgresEngineVersion.VER_13_3,
      instanceClass: InstanceClass.T2,
      instanceSize: InstanceSize.MICRO,
    },
    fargate: {
      imageVersion: "1.4.1",
      desiredCount: 1,
      maxCapacity: 2,
      minCapacity: 1,
      cpu: 256,
      memoryLimitMiB: 512,
    },
  },
  production: {
    db: {
      dbName: "featurehub",
      userName: "featurehub",
      preferredMaintenanceWindow: "Wed:10:00-Wed:11:00",
      version: PostgresEngineVersion.VER_13_3,
      instanceClass: InstanceClass.T3,
      instanceSize: InstanceSize.LARGE,
    },
    fargate: {
      imageVersion: "1.4.1",
      desiredCount: 2,
      maxCapacity: 8,
      minCapacity: 2,
      cpu: 256,
      memoryLimitMiB: 1024,
    },
  },
};

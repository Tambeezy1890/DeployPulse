import type {
  DeploymentStatus,
  Environment,
} from "../../../../generated/prisma/enums.js";

import type { ParamsDictionary } from "express-serve-static-core";

export interface CreateDeploymentBody {
  environment?: Environment;
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
}

export interface UpdateDeploymentStatusBody {
  status: DeploymentStatus;
  deploymentUrl?: string;
  logsUrl?: string;
}

export interface ProjectDeploymentParams extends ParamsDictionary {
  projectId: string;
}

export interface DeploymentParams extends ParamsDictionary {
  deploymentId: string;
}

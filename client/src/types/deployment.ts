export type DeploymentStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export type Environment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";

export interface Deployment {
  id: string;
  projectId: string;
  triggeredById: string;

  environment: Environment;
  status: DeploymentStatus;

  branch: string | null;
  commitSha: string | null;
  commitMessage: string | null;

  deploymentUrl: string | null;
  logsUrl: string | null;

  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateDeploymentData {
  environment: Environment;
  branch?: string;
  commitSha?: string;
  commitMessage?: string;
}

export interface UpdateDeploymentStatusData {
  status: DeploymentStatus;
  deploymentUrl?: string;
  logsUrl?: string;
}

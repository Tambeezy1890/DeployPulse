export type Environment = "production" | "development" | "staging";

export type DeploymentStatus = "success" | "failed" | "pending";

export interface Project {
  id: string;
  name: string;
  description?: string;
  environment: Environment;
  status: DeploymentStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  environment: Environment;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  environment?: Environment;
  status?: DeploymentStatus;
}

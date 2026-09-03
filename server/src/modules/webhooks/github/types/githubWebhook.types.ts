export interface GitHubDeployment {
  id: number;
  sha: string;
  ref: string;
  environment: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  full_name: string;
  html_url: string;
}

export interface GitHubDeploymentPayload {
  deployment: GitHubDeployment;
  repository: GitHubRepository;
}

export interface GitHubDeploymentStatusPayload {
  deployment: GitHubDeployment;

  deployment_status: {
    id: number;
    state:
      | "error"
      | "failure"
      | "inactive"
      | "in_progress"
      | "pending"
      | "queued"
      | "success";

    description: string | null;
    environment: string;
    environment_url: string | null;
    log_url: string | null;
    target_url: string | null;
    created_at: string;
    updated_at: string;
  };

  repository: GitHubRepository;
}

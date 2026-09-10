export type Provider =
  | "Vercel"
  | "Render"
  | "Railway"
  | "Netlify"
  | "AWS"
  | "Other";

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  repository: string | null;
  provider: Provider | null;
  healthCheckUrl: string | null;
  monitoringEnabled: boolean;
  ownerId: string;

  githubRepoFullName: string | null;
  githubRepositoryId: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string | null;
  repository?: string | null;
  provider?: Provider | null;
  healthCheckUrl?: string | null;
  monitoringEnabled?: boolean;
  githubRepositoryId?: string | null;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  repository?: string;
  provider?: Provider | null;
  healthCheckUrl?: string | null;
  monitoringEnabled?: boolean;
  githubRepositoryId?: string | null;
}

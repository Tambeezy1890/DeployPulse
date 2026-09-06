import api from "./api";

export type GitHubRepository = {
  id: string;
  githubRepositoryId: string;
  name: string;
  fullName: string;
  htmlUrl: string;
  private: boolean;
  defaultBranch: string | null;
};

export type GitHubInstallation = {
  id: string;
  githubInstallationId: string;
  githubAccountLogin: string;
  githubAccountType: string;
  repositorySelection: string;
  suspendedAt: string | null;
  createdAt?: string;
  repositories: GitHubRepository[];
};

type InstallUrlResponse = {
  success: boolean;
  installUrl: string;
};

type CompleteInstallationResponse = {
  success: boolean;
  message: string;
  installation: GitHubInstallation;
};

type InstallationsResponse = {
  success: boolean;
  installations: GitHubInstallation[];
};

const githubService = {
  async getInstallUrl(): Promise<string> {
    const response = await api.get<InstallUrlResponse>("/github/install-url");

    return response.data.installUrl;
  },

  async completeInstallation(
    installationId: string,
    state: string,
  ): Promise<GitHubInstallation> {
    const response = await api.post<CompleteInstallationResponse>(
      "/github/installations/complete",
      {
        installationId,
        state,
      },
    );

    return response.data.installation;
  },

  async getInstallations(): Promise<GitHubInstallation[]> {
    const response = await api.get<InstallationsResponse>(
      "/github/installations",
    );

    return response.data.installations;
  },
};

export default githubService;

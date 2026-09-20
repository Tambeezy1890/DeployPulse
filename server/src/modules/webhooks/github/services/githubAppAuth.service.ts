import jwt from "jsonwebtoken";
import { ApiError } from "../../../../utils/ApiError.js";
import {
  GITHUB_APP_ID,
  GITHUB_APP_PRIVATE_KEY,
} from "../../../../config/config.js";

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2022-11-28";

type InstallationTokenResponse = {
  token: string;
  expires_at: string;
};

export type GitHubAppInstallation = {
  id: number;
  account: {
    id: number;
    login: string;
    type: string;
    avatar_url: string;
  };
  repository_selection: "all" | "selected";
  suspended_at: string | null;
};

export type GitHubAppRepository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  default_branch: string;
};

type InstallationRepositoriesResponse = {
  total_count: number;
  repositories: GitHubAppRepository[];
};

function getRequiredGitHubConfig() {
  if (!GITHUB_APP_ID) {
    throw new ApiError("GITHUB_APP_ID is not configured.", 500);
  }

  if (!GITHUB_APP_PRIVATE_KEY) {
    throw new ApiError("GITHUB_APP_PRIVATE_KEY is not configured.", 500);
  }

  const privateKey = GITHUB_APP_PRIVATE_KEY.replace(/\\n/g, "\n")
    .replace(/^["']|["']$/g, "")
    .trim();

  if (
    !privateKey.includes("-----BEGIN") ||
    !privateKey.includes("PRIVATE KEY-----")
  ) {
    throw new ApiError(
      "GITHUB_APP_PRIVATE_KEY is not a valid PEM private key.",
      500,
    );
  }

  return {
    appId: GITHUB_APP_ID,
    privateKey,
  };
}

function generateGitHubAppJwt(): string {
  const { appId, privateKey } = getRequiredGitHubConfig();
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iat: now - 60,
      exp: now + 9 * 60,
      iss: appId,
    },
    privateKey,
    {
      algorithm: "RS256",
    },
  );
}

async function parseGitHubResponse<T>(
  response: globalThis.Response,
  fallbackMessage: string,
): Promise<T> {
  const responseBody = (await response.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;

  if (!response.ok) {
    const githubMessage =
      typeof responseBody?.message === "string"
        ? responseBody.message
        : fallbackMessage;

    console.error("GitHub API request failed:", {
      status: response.status,
      message: githubMessage,
    });

    throw new ApiError(
      `GitHub API error: ${githubMessage}`,
      response.status >= 500 ? 502 : response.status,
    );
  }

  return responseBody as T;
}

export async function getGitHubInstallation(
  installationId: string,
): Promise<GitHubAppInstallation> {
  const appJwt = generateGitHubAppJwt();

  const response = await fetch(
    `${GITHUB_API_URL}/app/installations/${encodeURIComponent(installationId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${appJwt}`,
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        "User-Agent": "DeployPulse",
      },
    },
  );

  return parseGitHubResponse<GitHubAppInstallation>(
    response,
    "Failed to retrieve GitHub installation.",
  );
}

export async function createInstallationAccessToken(
  installationId: string,
): Promise<InstallationTokenResponse> {
  const appJwt = generateGitHubAppJwt();

  const response = await fetch(
    `${GITHUB_API_URL}/app/installations/${encodeURIComponent(
      installationId,
    )}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${appJwt}`,
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        "User-Agent": "DeployPulse",
      },
    },
  );

  return parseGitHubResponse<InstallationTokenResponse>(
    response,
    "Failed to create GitHub installation access token.",
  );
}

export async function getInstallationRepositories(
  installationId: string,
): Promise<GitHubAppRepository[]> {
  const { token } = await createInstallationAccessToken(installationId);

  const repositories: GitHubAppRepository[] = [];
  let page = 1;

  while (true) {
    const response = await fetch(
      `${GITHUB_API_URL}/installation/repositories?per_page=100&page=${page}`,
      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": GITHUB_API_VERSION,
          "User-Agent": "DeployPulse",
        },
      },
    );

    const result = await parseGitHubResponse<InstallationRepositoriesResponse>(
      response,
      "Failed to retrieve installation repositories.",
    );

    repositories.push(...result.repositories);

    if (
      result.repositories.length < 100 ||
      repositories.length >= result.total_count
    ) {
      break;
    }

    page += 1;
  }

  return repositories;
}

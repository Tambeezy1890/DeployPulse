import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import jwt from "jsonwebtoken";
import { ApiError } from "../../../../utils/ApiError.js";
import {
  GITHUB_APP_ID,
  GITHUB_APP_PRIVATE_KEY_PATH,
} from "../../../../config/config.js";

const GITHUB_API_URL = "https://api.github.com";
const GITHUB_API_VERSION = "2026-03-10";

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

let privateKeyPromise: Promise<string> | null = null;

function getRequiredGitHubConfig() {
  if (!GITHUB_APP_ID) {
    throw new ApiError("GITHUB_APP_ID is not configured.", 500);
  }

  if (!GITHUB_APP_PRIVATE_KEY_PATH) {
    throw new ApiError("GITHUB_APP_PRIVATE_KEY_PATH is not configured.", 500);
  }

  return {
    appId: GITHUB_APP_ID,
    privateKeyPath: GITHUB_APP_PRIVATE_KEY_PATH,
  };
}

async function getPrivateKey(): Promise<string> {
  const { privateKeyPath } = getRequiredGitHubConfig();

  if (!privateKeyPromise) {
    const resolvedPath = resolve(process.cwd(), privateKeyPath);

    privateKeyPromise = readFile(resolvedPath, "utf8").catch(
      (error: unknown) => {
        privateKeyPromise = null;

        console.error("Failed to read GitHub App private key:", error);

        throw new ApiError("GitHub App private key could not be loaded.", 500);
      },
    );
  }

  return privateKeyPromise;
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

async function generateGitHubAppJwt(): Promise<string> {
  const privateKey = await getPrivateKey();
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iat: now - 60,
      exp: now + 9 * 60,
      iss: GITHUB_APP_ID,
    },
    privateKey,
    {
      algorithm: "RS256",
    },
  );
}

export async function getGitHubInstallation(
  installationId: string,
): Promise<GitHubAppInstallation> {
  const appJwt = await generateGitHubAppJwt();

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
  const appJwt = await generateGitHubAppJwt();

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

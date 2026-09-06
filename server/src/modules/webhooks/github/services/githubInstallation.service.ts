import {
  getGitHubInstallation,
  getInstallationRepositories,
} from "./githubAppAuth.service.js";

import {
  createGitHubSetupState,
  verifyGitHubSetupState,
} from "../utils/githubSetupState.js";
import { GITHUB_APP_SLUG } from "../../../../config/config.js";
import { ApiError } from "../../../../utils/ApiError.js";
import prisma from "../../../../config/prisma.js";

type CompleteInstallationInput = {
  userId: string;
  installationId: string;
  state: string;
};

export function createGitHubInstallationUrl(userId: string): string {
  if (!GITHUB_APP_SLUG) {
    throw new ApiError("GITHUB_APP_SLUG is not configured.", 500);
  }

  const state = createGitHubSetupState(userId);

  const installationUrl = new URL(
    `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`,
  );

  installationUrl.searchParams.set("state", state);

  return installationUrl.toString();
}

export async function completeGitHubInstallation({
  userId,
  installationId,
  state,
}: CompleteInstallationInput) {
  const setupState = verifyGitHubSetupState(state);

  if (setupState.userId !== userId) {
    throw new ApiError(
      "This GitHub installation belongs to a different session.",
      403,
    );
  }

  const githubInstallation = await getGitHubInstallation(installationId);

  if (String(githubInstallation.id) !== installationId) {
    throw new ApiError("GitHub returned an unexpected installation.", 400);
  }

  const existingInstallation = await prisma.gitHubInstallation.findUnique({
    where: {
      githubInstallationId: installationId,
    },
    select: {
      ownerId: true,
    },
  });

  if (existingInstallation && existingInstallation.ownerId !== userId) {
    throw new ApiError(
      "This GitHub installation is already connected to another user.",
      409,
    );
  }

  const githubRepositories = await getInstallationRepositories(installationId);

  const savedInstallation = await prisma.$transaction(async (transaction) => {
    const installation = await transaction.gitHubInstallation.upsert({
      where: {
        githubInstallationId: installationId,
      },
      create: {
        githubInstallationId: installationId,
        githubAccountId: String(githubInstallation.account.id),
        githubAccountLogin: githubInstallation.account.login,
        githubAccountType: githubInstallation.account.type,
        repositorySelection: githubInstallation.repository_selection,
        suspendedAt: githubInstallation.suspended_at
          ? new Date(githubInstallation.suspended_at)
          : null,
        ownerId: userId,
      },
      update: {
        githubAccountId: String(githubInstallation.account.id),
        githubAccountLogin: githubInstallation.account.login,
        githubAccountType: githubInstallation.account.type,
        repositorySelection: githubInstallation.repository_selection,
        suspendedAt: githubInstallation.suspended_at
          ? new Date(githubInstallation.suspended_at)
          : null,
      },
    });

    /*
     * Repositories previously available to this installation are marked
     * inactive first. Repositories returned by GitHub below are reactivated.
     */
    await transaction.gitHubRepository.updateMany({
      where: {
        installationId: installation.id,
      },
      data: {
        active: false,
      },
    });

    for (const repository of githubRepositories) {
      await transaction.gitHubRepository.upsert({
        where: {
          githubRepositoryId: String(repository.id),
        },
        create: {
          githubRepositoryId: String(repository.id),
          name: repository.name,
          fullName: repository.full_name.toLowerCase(),
          htmlUrl: repository.html_url,
          private: repository.private,
          defaultBranch: repository.default_branch,
          active: true,
          installationId: installation.id,
        },
        update: {
          name: repository.name,
          fullName: repository.full_name.toLowerCase(),
          htmlUrl: repository.html_url,
          private: repository.private,
          defaultBranch: repository.default_branch,
          active: true,
          installationId: installation.id,
        },
      });
    }

    return transaction.gitHubInstallation.findUniqueOrThrow({
      where: {
        id: installation.id,
      },
      select: {
        id: true,
        githubInstallationId: true,
        githubAccountLogin: true,
        githubAccountType: true,
        repositorySelection: true,
        suspendedAt: true,
        repositories: {
          where: {
            active: true,
          },
          orderBy: {
            fullName: "asc",
          },
          select: {
            id: true,
            githubRepositoryId: true,
            name: true,
            fullName: true,
            htmlUrl: true,
            private: true,
            defaultBranch: true,
          },
        },
      },
    });
  });

  return savedInstallation;
}

export async function getUserGitHubInstallations(userId: string) {
  return prisma.gitHubInstallation.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      githubInstallationId: true,
      githubAccountLogin: true,
      githubAccountType: true,
      repositorySelection: true,
      suspendedAt: true,
      createdAt: true,
      repositories: {
        where: {
          active: true,
        },
        orderBy: {
          fullName: "asc",
        },
        select: {
          id: true,
          githubRepositoryId: true,
          name: true,
          fullName: true,
          htmlUrl: true,
          private: true,
          defaultBranch: true,
        },
      },
    },
  });
}

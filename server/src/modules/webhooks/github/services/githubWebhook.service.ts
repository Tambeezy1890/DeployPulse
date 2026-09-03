import prisma from "../../../../config/prisma.js";

import type {
  DeploymentStatus,
  Environment,
} from "../../../../../generated/prisma/enums.js";

import type {
  GitHubDeploymentPayload,
  GitHubDeploymentStatusPayload,
} from "../types/githubWebhook.types.js";

function mapEnvironment(value: string): Environment {
  const environment = value.toLowerCase();

  if (environment.includes("development") || environment === "dev") {
    return "DEVELOPMENT";
  }

  if (environment.includes("staging") || environment.includes("preview")) {
    return "STAGING";
  }

  return "PRODUCTION";
}

function mapDeploymentStatus(
  state: GitHubDeploymentStatusPayload["deployment_status"]["state"],
): DeploymentStatus {
  switch (state) {
    case "queued":
    case "pending":
      return "PENDING";

    case "in_progress":
      return "RUNNING";

    case "success":
      return "SUCCESS";

    case "failure":
    case "error":
      return "FAILED";

    case "inactive":
      return "CANCELLED";
  }
}

function isFinishedStatus(status: DeploymentStatus) {
  return status === "SUCCESS" || status === "FAILED" || status === "CANCELLED";
}

async function findMatchingProjects(repositoryFullName: string) {
  return prisma.project.findMany({
    where: {
      githubRepoFullName: repositoryFullName.toLowerCase(),
    },

    select: {
      id: true,
    },
  });
}

export async function processGitHubDeployment(
  payload: GitHubDeploymentPayload,
) {
  const projects = await findMatchingProjects(payload.repository.full_name);

  const externalId = String(payload.deployment.id);
  const sourceUpdatedAt = new Date(payload.deployment.updated_at);

  for (const project of projects) {
    await prisma.deployment.upsert({
      where: {
        projectId_source_externalId: {
          projectId: project.id,
          source: "GITHUB",
          externalId,
        },
      },

      create: {
        projectId: project.id,
        source: "GITHUB",
        externalId,
        status: "PENDING",

        environment: mapEnvironment(payload.deployment.environment),

        branch: payload.deployment.ref,
        commitSha: payload.deployment.sha,
        commitMessage: payload.deployment.description,

        startedAt: new Date(payload.deployment.created_at),

        externalUpdatedAt: sourceUpdatedAt,
      },

      update: {
        environment: mapEnvironment(payload.deployment.environment),

        branch: payload.deployment.ref,
        commitSha: payload.deployment.sha,
        commitMessage: payload.deployment.description,
        externalUpdatedAt: sourceUpdatedAt,
      },
    });
  }

  return {
    projectsMatched: projects.length,
    deploymentsAffected: projects.length,
  };
}

export async function processGitHubDeploymentStatus(
  payload: GitHubDeploymentStatusPayload,
) {
  const projects = await findMatchingProjects(payload.repository.full_name);

  const externalId = String(payload.deployment.id);

  const status = mapDeploymentStatus(payload.deployment_status.state);

  const eventTime = new Date(payload.deployment_status.updated_at);

  let deploymentsAffected = 0;

  for (const project of projects) {
    const existingDeployment = await prisma.deployment.findUnique({
      where: {
        projectId_source_externalId: {
          projectId: project.id,
          source: "GITHUB",
          externalId,
        },
      },
    });

    if (
      existingDeployment?.externalUpdatedAt &&
      existingDeployment.externalUpdatedAt > eventTime
    ) {
      continue;
    }

    const startedAt =
      existingDeployment?.startedAt ?? new Date(payload.deployment.created_at);

    const finishedAt = isFinishedStatus(status) ? eventTime : null;

    const durationMs = finishedAt
      ? finishedAt.getTime() - startedAt.getTime()
      : null;

    await prisma.deployment.upsert({
      where: {
        projectId_source_externalId: {
          projectId: project.id,
          source: "GITHUB",
          externalId,
        },
      },

      create: {
        projectId: project.id,
        source: "GITHUB",
        externalId,
        status,

        environment: mapEnvironment(
          payload.deployment_status.environment ||
            payload.deployment.environment,
        ),

        branch: payload.deployment.ref,
        commitSha: payload.deployment.sha,
        commitMessage:
          payload.deployment_status.description ??
          payload.deployment.description,

        deploymentUrl:
          payload.deployment_status.environment_url ??
          payload.deployment_status.target_url,

        logsUrl: payload.deployment_status.log_url,

        startedAt,
        finishedAt,
        durationMs,
        externalUpdatedAt: eventTime,
      },

      update: {
        status,

        environment: mapEnvironment(
          payload.deployment_status.environment ||
            payload.deployment.environment,
        ),

        branch: payload.deployment.ref,
        commitSha: payload.deployment.sha,

        commitMessage:
          payload.deployment_status.description ??
          payload.deployment.description,

        deploymentUrl:
          payload.deployment_status.environment_url ??
          payload.deployment_status.target_url,

        logsUrl: payload.deployment_status.log_url,

        startedAt,
        finishedAt,
        durationMs,
        externalUpdatedAt: eventTime,
      },
    });

    deploymentsAffected += 1;
  }

  return {
    projectsMatched: projects.length,
    deploymentsAffected,
  };
}

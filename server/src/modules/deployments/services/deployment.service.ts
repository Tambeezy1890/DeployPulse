import prisma from "../../../config/prisma.js";
import { ApiError } from "../../../utils/ApiError.js";

import { getOwnedProjectService } from "../../projects/services/project.service.js";

import type {
  CreateDeploymentBody,
  UpdateDeploymentStatusBody,
} from "../types/deployment.types.js";

import type { DeploymentStatus } from "../../../../generated/prisma/enums.js";

export const createDeploymentService = async (
  projectId: string,
  ownerId: string,
  data: CreateDeploymentBody,
) => {
  await getOwnedProjectService(projectId, ownerId);

  return prisma.deployment.create({
    data: {
      projectId,
      triggeredById: ownerId,
      environment: data.environment,
      branch: data.branch?.trim(),
      commitSha: data.commitSha?.trim(),
      commitMessage: data.commitMessage?.trim(),
    },
  });
};

export const getDeploymentsService = async (
  projectId: string,
  ownerId: string,
) => {
  await getOwnedProjectService(projectId, ownerId);

  return prisma.deployment.findMany({
    where: {
      projectId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getDeploymentByIdService = async (
  ownerId: string,
  deploymentId: string,
) => {
  const deployment = await prisma.deployment.findFirst({
    where: {
      id: deploymentId,
      project: {
        ownerId,
      },
    },
  });

  if (!deployment) {
    throw new ApiError("Deployment not found.", 404);
  }

  return deployment;
};

const allowedTransitions: Record<DeploymentStatus, DeploymentStatus[]> = {
  PENDING: ["RUNNING", "CANCELLED"],
  RUNNING: ["SUCCESS", "FAILED", "CANCELLED"],
  SUCCESS: [],
  FAILED: [],
  CANCELLED: [],
};

export const updateDeploymentStatusService = async (
  ownerId: string,
  deploymentId: string,
  data: UpdateDeploymentStatusBody,
) => {
  const deployment = await getDeploymentByIdService(ownerId, deploymentId);

  const permittedStatuses = allowedTransitions[deployment.status];

  if (!permittedStatuses.includes(data.status)) {
    throw new ApiError(
      `Cannot change deployment status from ${deployment.status} to ${data.status}.`,
      409,
    );
  }

  const now = new Date();

  let startedAt = deployment.startedAt;
  let finishedAt = deployment.finishedAt;
  let durationMs = deployment.durationMs;

  if (data.status === "RUNNING") {
    startedAt = now;
    finishedAt = null;
    durationMs = null;
  }

  const isFinishedStatus = ["SUCCESS", "FAILED", "CANCELLED"].includes(
    data.status,
  );

  if (isFinishedStatus) {
    finishedAt = now;

    if (startedAt) {
      durationMs = finishedAt.getTime() - startedAt.getTime();
    }
  }

  return prisma.deployment.update({
    where: {
      id: deploymentId,
    },
    data: {
      status: data.status,
      deploymentUrl: data.deploymentUrl?.trim(),
      logsUrl: data.logsUrl?.trim(),
      startedAt,
      finishedAt,
      durationMs,
    },
  });
};

export const deleteDeploymentService = async (
  ownerId: string,
  deploymentId: string,
) => {
  await getDeploymentByIdService(ownerId, deploymentId);

  return prisma.deployment.delete({
    where: {
      id: deploymentId,
    },
  });
};

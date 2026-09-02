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

  const deployment = await prisma.deployment.create({
    data: {
      projectId,
      triggeredById: ownerId,

      environment: data.environment,

      branch: data.branch?.trim() || null,

      commitSha: data.commitSha?.trim() || null,

      commitMessage: data.commitMessage?.trim() || null,

      status: "PENDING",
    },
  });

  simulateDeployment(deployment.id);

  return deployment;
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
  projectId: string,
  ownerId: string,
  deploymentId: string,
) => {
  const deployment = await prisma.deployment.findFirst({
    where: {
      id: deploymentId,
      projectId,

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
  projectId: string,
  ownerId: string,
  deploymentId: string,
  data: UpdateDeploymentStatusBody,
) => {
  const deployment = await getDeploymentByIdService(
    projectId,
    ownerId,
    deploymentId,
  );

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

  const finishedStatuses: DeploymentStatus[] = [
    "SUCCESS",
    "FAILED",
    "CANCELLED",
  ];

  if (finishedStatuses.includes(data.status)) {
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
  projectId: string,
  ownerId: string,
  deploymentId: string,
) => {
  await getDeploymentByIdService(projectId, ownerId, deploymentId);

  return prisma.deployment.delete({
    where: {
      id: deploymentId,
    },
  });
};

async function simulateDeployment(deploymentId: string) {
  setTimeout(async () => {
    try {
      const deployment = await prisma.deployment.findUnique({
        where: {
          id: deploymentId,
        },
      });

      if (!deployment || deployment.status !== "PENDING") {
        return;
      }

      await prisma.deployment.update({
        where: {
          id: deploymentId,
        },

        data: {
          status: "RUNNING",
          startedAt: new Date(),
        },
      });

      setTimeout(async () => {
        try {
          const runningDeployment = await prisma.deployment.findUnique({
            where: {
              id: deploymentId,
            },
          });

          if (!runningDeployment || runningDeployment.status !== "RUNNING") {
            return;
          }

          const finishedAt = new Date();

          const succeeded = Math.random() > 0.8;

          const status: DeploymentStatus = succeeded ? "SUCCESS" : "FAILED";

          const durationMs = runningDeployment.startedAt
            ? finishedAt.getTime() - runningDeployment.startedAt.getTime()
            : null;

          await prisma.deployment.update({
            where: {
              id: deploymentId,
            },

            data: {
              status,
              finishedAt,
              durationMs,
            },
          });
        } catch (error) {
          console.error("Deployment simulation failed:", error);
        }
      }, 5000);
    } catch (error) {
      console.error("Deployment simulation failed:", error);
    }
  }, 1000);
}

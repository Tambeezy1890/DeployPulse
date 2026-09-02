// Adjust this to match your existing Prisma import.

import prisma from "../../../config/prisma.js";
import { getOwnedProjectService } from "../../projects/services/project.service.js";
import { checkUrl } from "../utils/checkUrl.js";
import { calculateNextMonitorState } from "../utils/healthState.js";

export async function checkProjectHealth(projectId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      id: true,
      healthCheckUrl: true,
      monitoringEnabled: true,
      monitorStatus: true,
      consecutiveFailures: true,
      consecutiveSuccesses: true,
    },
  });

  if (!project) {
    throw new Error("Project not found.");
  }

  if (!project.monitoringEnabled || !project.healthCheckUrl) {
    return null;
  }

  const result = await checkUrl(project.healthCheckUrl);

  const nextState = calculateNextMonitorState(
    {
      monitorStatus: project.monitorStatus,
      consecutiveFailures: project.consecutiveFailures,
      consecutiveSuccesses: project.consecutiveSuccesses,
    },
    result.status,
  );

  const checkedAt = new Date();

  const [healthCheck] = await prisma.$transaction([
    prisma.healthCheck.create({
      data: {
        projectId: project.id,
        checkedUrl: project.healthCheckUrl,
        status: result.status,
        statusCode: result.statusCode,
        responseTimeMs: result.responseTimeMs,
        errorMessage: result.errorMessage,
        checkedAt,
      },
    }),

    prisma.project.update({
      where: {
        id: project.id,
      },
      data: {
        monitorStatus: nextState.monitorStatus,
        consecutiveFailures: nextState.consecutiveFailures,
        consecutiveSuccesses: nextState.consecutiveSuccesses,
        lastCheckedAt: checkedAt,

        ...(nextState.statusChanged && {
          monitorStatusChangedAt: checkedAt,
        }),
      },
    }),
  ]);

  console.log(
    [
      `Health check completed for ${project.id}:`,
      `${result.status} → ${nextState.monitorStatus}`,
      `(failures: ${nextState.consecutiveFailures},`,
      `successes: ${nextState.consecutiveSuccesses})`,
    ].join(" "),
  );

  return healthCheck;
}

export async function checkEnabledProjects() {
  const projects = await prisma.project.findMany({
    where: {
      monitoringEnabled: true,
      healthCheckUrl: { not: null },
    },
    select: {
      id: true,
    },
  });

  for (const project of projects) {
    try {
      await checkProjectHealth(project.id);
    } catch (error) {
      console.error(`Health check failed for project ${project.id}:`, error);
    }
  }
}

export async function getProjectHealthChecks(
  projectId: string,
  ownerId: string,
) {
  const project = await getOwnedProjectService(projectId, ownerId);

  const checks = await prisma.healthCheck.findMany({
    where: {
      projectId,
    },
    orderBy: {
      checkedAt: "desc",
    },
    take: 30,
  });

  const latestCheck = checks[0] ?? null;

  const completedChecks = checks.filter(
    (check) => check.status === "UP" || check.status === "DOWN",
  );

  const upChecks = completedChecks.filter(
    (check) => check.status === "UP",
  ).length;

  const uptimePercentage =
    completedChecks.length === 0
      ? null
      : Number(((upChecks / completedChecks.length) * 100).toFixed(1));

  const responseTimes = checks
    .map((check) => check.responseTimeMs)
    .filter((responseTime): responseTime is number => responseTime !== null);

  const averageResponseTimeMs =
    responseTimes.length === 0
      ? null
      : Math.round(
          responseTimes.reduce(
            (total, responseTime) => total + responseTime,
            0,
          ) / responseTimes.length,
        );

  return {
    latestCheck,
    checks,

    monitor: {
      status: project.monitorStatus,
      consecutiveFailures: project.consecutiveFailures,
      consecutiveSuccesses: project.consecutiveSuccesses,
      statusChangedAt: project.monitorStatusChangedAt,
      lastCheckedAt: project.lastCheckedAt,
    },

    metrics: {
      uptimePercentage,
      averageResponseTimeMs,
      totalChecks: checks.length,
    },
  };
}

import prisma from "../../../config/prisma.js";
import { ApiError } from "../../../utils/ApiError.js";

import type {
  IncidentMetadata,
  IncidentSignalCause,
  IncidentSignalSeverity,
  OpenIncidentSignal,
} from "../types/incident.types.js";

const getActiveKey = (projectId: string) => `project:${projectId}`;

function getCombinedCause(
  existingCause: "DEPLOYMENT" | "HEALTH" | "COMBINED",
  incomingCause: IncidentSignalCause,
) {
  if (existingCause === "COMBINED") {
    return "COMBINED" as const;
  }

  if (existingCause !== incomingCause) {
    return "COMBINED" as const;
  }

  return existingCause;
}

function getHighestSeverity(
  existingSeverity: "WARNING" | "CRITICAL",
  incomingSeverity: IncidentSignalSeverity,
) {
  if (existingSeverity === "CRITICAL" || incomingSeverity === "CRITICAL") {
    return "CRITICAL" as const;
  }

  return "WARNING" as const;
}

export async function openOrUpdateIncident(signal: OpenIncidentSignal) {
  const now = new Date();
  const activeKey = getActiveKey(signal.projectId);

  /*
   * Upsert prevents two simultaneous signals from creating
   * separate open incidents for the same project.
   */
  const incident = await prisma.incident.upsert({
    where: {
      activeKey,
    },

    create: {
      projectId: signal.projectId,
      activeKey,
      title:
        signal.severity === "CRITICAL"
          ? "Service disruption detected"
          : "Project requires attention",
      summary: signal.message,
      status: "OPEN",
      severity: signal.severity,
      cause: signal.cause,
      openedAt: now,
      lastActivityAt: now,

      events: {
        create: {
          type: "INCIDENT_OPENED",
          message: "DeployPulse opened this incident automatically.",
          createdAt: now,
        },
      },
    },

    update: {
      summary: signal.message,
      lastActivityAt: now,
    },
  });

  const nextCause = getCombinedCause(incident.cause, signal.cause);

  const nextSeverity = getHighestSeverity(incident.severity, signal.severity);

  const severityEscalated =
    incident.severity === "WARNING" && nextSeverity === "CRITICAL";

  const updatedIncident = await prisma.incident.update({
    where: {
      id: incident.id,
    },

    data: {
      cause: nextCause,
      severity: nextSeverity,
      title:
        nextSeverity === "CRITICAL"
          ? "Service disruption detected"
          : "Project requires attention",
      summary: signal.message,
      lastActivityAt: now,

      ...(severityEscalated && {
        events: {
          create: {
            type: "INCIDENT_ESCALATED",
            message: "Incident severity escalated from warning to critical.",
            createdAt: now,
          },
        },
      }),
    },
  });

  /*
   * A repeated webhook or health signal will have the same
   * dedupeKey and therefore won't create another timeline event.
   */
  await prisma.incidentEvent.upsert({
    where: {
      dedupeKey: signal.dedupeKey,
    },

    create: {
      incidentId: updatedIncident.id,
      type: signal.eventType,
      message: signal.message,
      sourceId: signal.sourceId,
      dedupeKey: signal.dedupeKey,
      metadata: signal.metadata,
      createdAt: now,
    },

    update: {},
  });

  return prisma.incident.findUnique({
    where: {
      id: updatedIncident.id,
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

async function addEventToOpenIncident({
  projectId,
  type,
  message,
  sourceId,
  dedupeKey,
  metadata,
}: {
  projectId: string;
  type: "HEALTH_RECOVERING" | "HEALTHY";
  message: string;
  sourceId: string;
  dedupeKey: string;
  metadata?: IncidentMetadata;
}) {
  const incident = await prisma.incident.findUnique({
    where: {
      activeKey: getActiveKey(projectId),
    },
  });

  if (!incident) {
    return null;
  }

  await prisma.incidentEvent.upsert({
    where: {
      dedupeKey,
    },

    create: {
      incidentId: incident.id,
      type,
      message,
      sourceId,
      dedupeKey,
      metadata,
    },

    update: {},
  });

  await prisma.incident.update({
    where: {
      id: incident.id,
    },

    data: {
      lastActivityAt: new Date(),
    },
  });

  return incident;
}

async function resolveActiveIncident({
  projectId,
  message,
  sourceId,
  dedupeKey,
  resolutionSource,
}: {
  projectId: string;
  message: string;
  sourceId: string;
  dedupeKey: string;
  resolutionSource: "HEALTH" | "DEPLOYMENT";
}) {
  const incident = await prisma.incident.findUnique({
    where: {
      activeKey: getActiveKey(projectId),
    },
  });

  if (!incident) {
    return null;
  }

  /*
   * Healthy checks should not resolve deployment-only incidents.
   * Successful deployments should not resolve health-only incidents.
   */
  if (resolutionSource === "HEALTH" && incident.cause === "DEPLOYMENT") {
    return incident;
  }

  if (resolutionSource === "DEPLOYMENT" && incident.cause === "HEALTH") {
    return incident;
  }

  const now = new Date();

  return prisma.incident.update({
    where: {
      id: incident.id,
    },

    data: {
      status: "RESOLVED",
      activeKey: null,
      resolvedAt: now,
      lastActivityAt: now,
      summary: message,

      events: {
        create: {
          type: "INCIDENT_RESOLVED",
          message,
          sourceId,
          dedupeKey,
          createdAt: now,
        },
      },
    },

    include: {
      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function recordDeploymentFailure({
  projectId,
  deploymentId,
  message,
  branch,
  environment,
}: {
  projectId: string;
  deploymentId: string;
  message: string;
  branch?: string | null;
  environment?: string | null;
}) {
  return openOrUpdateIncident({
    projectId,
    cause: "DEPLOYMENT",
    severity: "WARNING",
    eventType: "DEPLOYMENT_FAILED",
    message,
    sourceId: deploymentId,
    dedupeKey: `deployment:${deploymentId}:failed`,
    metadata: {
      branch: branch ?? null,
      environment: environment ?? null,
    },
  });
}

export async function recordDeploymentSuccess({
  projectId,
  deploymentId,
}: {
  projectId: string;
  deploymentId: string;
}) {
  return resolveActiveIncident({
    projectId,
    message:
      "A successful deployment was completed and the deployment incident was resolved.",
    sourceId: deploymentId,
    dedupeKey: `deployment:${deploymentId}:resolved`,
    resolutionSource: "DEPLOYMENT",
  });
}

export async function recordHealthTransition({
  projectId,
  healthCheckId,
  previousStatus,
  currentStatus,
  statusCode,
  errorMessage,
}: {
  projectId: string;
  healthCheckId: string;
  previousStatus: string;
  currentStatus: string;
  statusCode?: number | null;
  errorMessage?: string | null;
}) {
  const metadata: IncidentMetadata = {
    previousStatus,
    currentStatus,
    statusCode: statusCode ?? null,
    errorMessage: errorMessage ?? null,
  };

  if (currentStatus === "DEGRADED") {
    return openOrUpdateIncident({
      projectId,
      cause: "HEALTH",
      severity: "WARNING",
      eventType: "HEALTH_DEGRADED",
      message: "The project health check is degraded and requires attention.",
      sourceId: healthCheckId,
      dedupeKey: `health:${healthCheckId}:degraded`,
      metadata,
    });
  }

  if (currentStatus === "DOWN") {
    return openOrUpdateIncident({
      projectId,
      cause: "HEALTH",
      severity: "CRITICAL",
      eventType: "HEALTH_DOWN",
      message:
        errorMessage ||
        "The monitored project endpoint is currently unavailable.",
      sourceId: healthCheckId,
      dedupeKey: `health:${healthCheckId}:down`,
      metadata,
    });
  }

  if (currentStatus === "RECOVERING") {
    return addEventToOpenIncident({
      projectId,
      type: "HEALTH_RECOVERING",
      message:
        "The project endpoint is responding and appears to be recovering.",
      sourceId: healthCheckId,
      dedupeKey: `health:${healthCheckId}:recovering`,
      metadata,
    });
  }

  if (currentStatus === "HEALTHY") {
    await addEventToOpenIncident({
      projectId,
      type: "HEALTHY",
      message: "The monitored endpoint is healthy again.",
      sourceId: healthCheckId,
      dedupeKey: `health:${healthCheckId}:healthy`,
      metadata,
    });

    return resolveActiveIncident({
      projectId,
      message:
        "The monitored endpoint recovered and the incident was resolved.",
      sourceId: healthCheckId,
      dedupeKey: `health:${healthCheckId}:resolved`,
      resolutionSource: "HEALTH",
    });
  }

  return null;
}

export async function getIncidentsService(
  ownerId: string,
  status?: "OPEN" | "RESOLVED",
) {
  return prisma.incident.findMany({
    where: {
      project: {
        ownerId,
      },

      ...(status && {
        status,
      }),
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },

    orderBy: [
      {
        status: "asc",
      },
      {
        lastActivityAt: "desc",
      },
    ],
  });
}

export async function getIncidentByIdService(
  incidentId: string,
  ownerId: string,
) {
  const incident = await prisma.incident.findFirst({
    where: {
      id: incidentId,
      project: {
        ownerId,
      },
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!incident) {
    throw new ApiError("Incident not found.", 404);
  }

  return incident;
}

export async function manuallyResolveIncidentService(
  incidentId: string,
  ownerId: string,
) {
  const incident = await getIncidentByIdService(incidentId, ownerId);

  if (incident.status === "RESOLVED") {
    throw new ApiError("Incident is already resolved.", 409);
  }

  const now = new Date();

  return prisma.incident.update({
    where: {
      id: incident.id,
    },

    data: {
      status: "RESOLVED",
      activeKey: null,
      resolvedAt: now,
      lastActivityAt: now,

      events: {
        create: {
          type: "INCIDENT_RESOLVED",
          message: "Incident was manually resolved by the user.",
          createdAt: now,
        },
      },
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      events: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

import prisma from "../../../config/prisma.js";

import { decryptNotificationSecret } from "./notificationEncryption.service.js";
import { sendDiscordWebhook } from "./discord.service.js";

type NotificationEventType =
  | "INCIDENT_OPENED"
  | "INCIDENT_UPDATED"
  | "INCIDENT_RESOLVED";

type DispatchIncidentNotificationOptions = {
  incidentId: string;
  eventType: NotificationEventType;

  /*
   * A stable identifier for the event that triggered this notification.
   *
   * Examples:
   * incident:abc:opened
   * deployment:xyz:failed
   * health:xyz:down
   * incident:abc:resolved
   */
  eventKey: string;
};

type IncidentNotificationContent = {
  title: string;
  description: string;
  color: number;
  fields: Array<{
    name: string;
    value: string;
    inline?: boolean;
  }>;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message.slice(0, 1_000);
  }

  return "An unknown notification delivery error occurred.";
}

function formatValue(value: string | null | undefined) {
  if (!value) {
    return "Not available";
  }

  return value;
}

function getNotificationContent(
  eventType: NotificationEventType,
  incident: {
    title: string;
    summary: string | null;
    severity: "WARNING" | "CRITICAL";
    cause: "DEPLOYMENT" | "HEALTH" | "COMBINED";
    openedAt: Date;
    resolvedAt: Date | null;
    project: {
      name: string;
    };
  },
): IncidentNotificationContent {
  const commonFields = [
    {
      name: "Project",
      value: incident.project.name,
      inline: true,
    },
    {
      name: "Severity",
      value: incident.severity,
      inline: true,
    },
    {
      name: "Cause",
      value: incident.cause,
      inline: true,
    },
  ];

  if (eventType === "INCIDENT_OPENED") {
    return {
      title:
        incident.severity === "CRITICAL"
          ? "🚨 Critical incident opened"
          : "⚠️ Incident opened",
      description: formatValue(incident.summary ?? incident.title),
      color: incident.severity === "CRITICAL" ? 15_158_332 : 16_753_920,
      fields: [
        ...commonFields,
        {
          name: "Opened",
          value: incident.openedAt.toISOString(),
          inline: false,
        },
      ],
    };
  }

  if (eventType === "INCIDENT_RESOLVED") {
    return {
      title: "✅ Incident resolved",
      description: formatValue(
        incident.summary ?? "The incident has been resolved.",
      ),
      color: 5_763_719,
      fields: [
        ...commonFields,
        {
          name: "Resolved",
          value: (incident.resolvedAt ?? new Date()).toISOString(),
          inline: false,
        },
      ],
    };
  }

  return {
    title:
      incident.severity === "CRITICAL"
        ? "🚨 Incident escalated"
        : "🔄 Incident updated",
    description: formatValue(incident.summary ?? incident.title),
    color: incident.severity === "CRITICAL" ? 15_158_332 : 5_795_967,
    fields: commonFields,
  };
}

async function deliverToChannel({
  channel,
  incident,
  eventType,
  eventKey,
}: {
  channel: {
    id: string;
    name: string;
    type: "DISCORD" | "SLACK";
    webhookUrl: string;
  };
  incident: {
    id: string;
    title: string;
    summary: string | null;
    severity: "WARNING" | "CRITICAL";
    cause: "DEPLOYMENT" | "HEALTH" | "COMBINED";
    openedAt: Date;
    resolvedAt: Date | null;
    project: {
      name: string;
    };
  };
  eventType: NotificationEventType;
  eventKey: string;
}) {
  /*
   * Including the channel ID means the same incident event can be sent once
   * to every enabled channel without producing duplicate deliveries.
   */
  const dedupeKey = `${eventKey}:channel:${channel.id}`;

  const delivery = await prisma.notificationDelivery.upsert({
    where: {
      dedupeKey,
    },
    create: {
      channelId: channel.id,
      incidentId: incident.id,
      eventType,
      status: "PENDING",
      dedupeKey,
    },
    update: {},
  });

  /*
   * Repeated webhooks and polling cycles must not resend a notification that
   * Discord has already accepted.
   */
  if (delivery.status === "SENT") {
    return {
      channelId: channel.id,
      status: "SKIPPED" as const,
    };
  }

  await prisma.notificationDelivery.update({
    where: {
      id: delivery.id,
    },
    data: {
      status: "PENDING",
      attemptCount: {
        increment: 1,
      },
      errorMessage: null,
    },
  });

  try {
    if (channel.type !== "DISCORD") {
      throw new Error(
        `Notification channel type ${channel.type} is not supported yet.`,
      );
    }

    const webhookUrl = decryptNotificationSecret(channel.webhookUrl);
    const content = getNotificationContent(eventType, incident);

    await sendDiscordWebhook({
      webhookUrl,
      title: content.title,
      description: content.description,
      color: content.color,
      fields: content.fields,
    });

    await prisma.notificationDelivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "SENT",
        deliveredAt: new Date(),
        errorMessage: null,
      },
    });

    return {
      channelId: channel.id,
      status: "SENT" as const,
    };
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    await prisma.notificationDelivery.update({
      where: {
        id: delivery.id,
      },
      data: {
        status: "FAILED",
        errorMessage,
      },
    });

    /*
     * Do not rethrow here. A Discord failure must never prevent an incident
     * from opening, updating, or resolving.
     */
    console.error(
      `Notification delivery ${delivery.id} failed for channel ${channel.id}:`,
      errorMessage,
    );

    return {
      channelId: channel.id,
      status: "FAILED" as const,
      errorMessage,
    };
  }
}

export async function dispatchIncidentNotification({
  incidentId,
  eventType,
  eventKey,
}: DispatchIncidentNotificationOptions) {
  const incident = await prisma.incident.findUnique({
    where: {
      id: incidentId,
    },
    select: {
      id: true,
      title: true,
      summary: true,
      severity: true,
      cause: true,
      openedAt: true,
      resolvedAt: true,
      project: {
        select: {
          name: true,
          notificationChannels: {
            where: {
              enabled: true,
            },
            select: {
              id: true,
              name: true,
              type: true,
              webhookUrl: true,
            },
          },
        },
      },
    },
  });

  if (!incident) {
    console.error(
      `Notification dispatch skipped because incident ${incidentId} was not found.`,
    );

    return [];
  }

  if (incident.project.notificationChannels.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    incident.project.notificationChannels.map((channel) =>
      deliverToChannel({
        channel,
        incident,
        eventType,
        eventKey,
      }),
    ),
  );

  /*
   * Promise.allSettled provides a final safety boundary so one channel cannot
   * interrupt delivery to the remaining channels.
   */
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const channel = incident.project.notificationChannels[index];

      console.error(
        `Unexpected notification failure for channel ${channel?.id}:`,
        getErrorMessage(result.reason),
      );
    }
  });

  return results;
}

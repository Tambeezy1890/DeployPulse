import prisma from "../../../config/prisma.js";

import { ApiError } from "../../../utils/ApiError.js";

import {
  decryptNotificationSecret,
  encryptNotificationSecret,
} from "./notificationEncryption.service.js";

import type {
  CreateDiscordChannelBody,
  UpdateNotificationChannelBody,
} from "../types/notification.types.ts";
import { sendDiscordWebhook } from "./ discord.service.js";

async function getOwnedProject(projectId: string, ownerId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },

    select: {
      id: true,
      name: true,
    },
  });

  if (!project) {
    throw new ApiError("Project not found.", 404);
  }

  return project;
}

async function getOwnedNotificationChannel(channelId: string, ownerId: string) {
  const channel = await prisma.notificationChannel.findFirst({
    where: {
      id: channelId,

      project: {
        ownerId,
      },
    },

    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!channel) {
    throw new ApiError("Notification channel not found.", 404);
  }

  return channel;
}

export async function createDiscordChannelService(
  ownerId: string,
  projectId: string,
  data: CreateDiscordChannelBody,
) {
  const project = await getOwnedProject(projectId, ownerId);

  const webhookUrl = data.webhookUrl.trim();

  /*
   * Validate the encryption configuration before contacting Discord.
   */
  const encryptedWebhookUrl = encryptNotificationSecret(webhookUrl);

  await sendDiscordWebhook({
    webhookUrl,
    title: "DeployPulse connected",
    description: `Discord notifications are now enabled for **${project.name}**.`,
    color: 5_795_967,

    fields: [
      {
        name: "Project",
        value: project.name,
        inline: true,
      },
      {
        name: "Status",
        value: "Connected",
        inline: true,
      },
    ],
  });

  return prisma.notificationChannel.create({
    data: {
      name: data.name.trim(),
      type: "DISCORD",
      webhookUrl: encryptedWebhookUrl,
      projectId,
    },

    select: {
      id: true,
      name: true,
      type: true,
      enabled: true,
      projectId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getProjectNotificationChannelsService(
  ownerId: string,
  projectId: string,
) {
  await getOwnedProject(projectId, ownerId);

  return prisma.notificationChannel.findMany({
    where: {
      projectId,
    },

    select: {
      id: true,
      name: true,
      type: true,
      enabled: true,
      projectId: true,
      createdAt: true,
      updatedAt: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function testNotificationChannelService(
  ownerId: string,
  channelId: string,
) {
  const channel = await getOwnedNotificationChannel(channelId, ownerId);

  if (!channel.enabled) {
    throw new ApiError(
      "Enable this notification channel before testing it.",
      409,
    );
  }

  if (channel.type !== "DISCORD") {
    throw new ApiError("This notification provider is not supported yet.", 422);
  }

  const webhookUrl = decryptNotificationSecret(channel.webhookUrl);

  const result = await sendDiscordWebhook({
    webhookUrl,
    title: "DeployPulse test notification",
    description: `Your **${channel.name}** notification channel is working correctly.`,
    color: 5_795_967,

    fields: [
      {
        name: "Project",
        value: channel.project.name,
        inline: true,
      },
      {
        name: "Provider",
        value: "Discord",
        inline: true,
      },
    ],
  });

  return {
    messageId: result.id,
  };
}

export async function updateNotificationChannelService(
  ownerId: string,
  channelId: string,
  data: UpdateNotificationChannelBody,
) {
  await getOwnedNotificationChannel(channelId, ownerId);

  return prisma.notificationChannel.update({
    where: {
      id: channelId,
    },

    data: {
      name: data.name === undefined ? undefined : data.name.trim(),

      enabled: data.enabled,
    },

    select: {
      id: true,
      name: true,
      type: true,
      enabled: true,
      projectId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function deleteNotificationChannelService(
  ownerId: string,
  channelId: string,
) {
  await getOwnedNotificationChannel(channelId, ownerId);

  await prisma.notificationChannel.delete({
    where: {
      id: channelId,
    },
  });
}

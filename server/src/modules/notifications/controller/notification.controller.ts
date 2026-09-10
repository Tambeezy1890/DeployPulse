import asyncHandler from "../../../utils/AsyncHandler.js";

import { ApiError } from "../../../utils/ApiError.js";

import {
  createDiscordChannelService,
  deleteNotificationChannelService,
  getProjectNotificationChannelsService,
  testNotificationChannelService,
  updateNotificationChannelService,
} from "../services/notification.service.js";

import type {
  CreateDiscordChannelBody,
  NotificationChannelParams,
  ProjectNotificationParams,
  UpdateNotificationChannelBody,
} from "../types/notification.types.js";

export const createDiscordChannel = asyncHandler<
  ProjectNotificationParams,
  unknown,
  CreateDiscordChannelBody
>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const channel = await createDiscordChannelService(
    req.user.id,
    req.params.projectId,
    req.body,
  );

  return res.status(201).json({
    success: true,
    message: "Discord notification channel connected successfully.",
    channel,
  });
});

export const getProjectNotificationChannels =
  asyncHandler<ProjectNotificationParams>(async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const channels = await getProjectNotificationChannelsService(
      req.user.id,
      req.params.projectId,
    );

    return res.status(200).json({
      success: true,
      channels,
    });
  });

export const testNotificationChannel = asyncHandler<NotificationChannelParams>(
  async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const result = await testNotificationChannelService(
      req.user.id,
      req.params.channelId,
    );

    return res.status(200).json({
      success: true,
      message: "Test notification sent successfully.",
      ...result,
    });
  },
);

export const updateNotificationChannel = asyncHandler<
  NotificationChannelParams,
  unknown,
  UpdateNotificationChannelBody
>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const channel = await updateNotificationChannelService(
    req.user.id,
    req.params.channelId,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Notification channel updated successfully.",
    channel,
  });
});

export const deleteNotificationChannel =
  asyncHandler<NotificationChannelParams>(async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    await deleteNotificationChannelService(req.user.id, req.params.channelId);

    return res.status(200).json({
      success: true,
      message: "Notification channel deleted successfully.",
    });
  });

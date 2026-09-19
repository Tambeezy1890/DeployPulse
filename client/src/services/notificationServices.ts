import api from "./api";

import type {
  CreateDiscordChannelData,
  NotificationChannel,
  UpdateNotificationChannelData,
} from "../types/notification";

type NotificationChannelsResponse = {
  success: boolean;
  channels: NotificationChannel[];
};

type CreateNotificationChannelResponse = {
  success: boolean;
  message: string;
  channel: NotificationChannel;
};

type UpdateNotificationChannelResponse = {
  success: boolean;
  message: string;
  channel: NotificationChannel;
};

type TestNotificationChannelResponse = {
  success: boolean;
  message: string;
  messageId: string;
};

type DeleteNotificationChannelResponse = {
  success: boolean;
  message: string;
};

const notificationService = {
  async getProjectChannels(projectId: string): Promise<NotificationChannel[]> {
    const response = await api.get<NotificationChannelsResponse>(
      `/projects/${projectId}/notifications`,
    );

    return response.data.channels;
  },

  async createDiscordChannel(
    projectId: string,
    data: CreateDiscordChannelData,
  ): Promise<NotificationChannel> {
    const response = await api.post<CreateNotificationChannelResponse>(
      `/projects/${projectId}/notifications/discord`,
      data,
    );

    return response.data.channel;
  },

  async updateChannel(
    channelId: string,
    data: UpdateNotificationChannelData,
  ): Promise<NotificationChannel> {
    const response = await api.patch<UpdateNotificationChannelResponse>(
      `/notifications/${channelId}`,
      data,
    );

    return response.data.channel;
  },

  async testChannel(channelId: string): Promise<string> {
    const response = await api.post<TestNotificationChannelResponse>(
      `/notifications/${channelId}/test`,
    );

    return response.data.messageId;
  },

  async deleteChannel(channelId: string): Promise<void> {
    await api.delete<DeleteNotificationChannelResponse>(
      `/notifications/${channelId}`,
    );
  },
};

export default notificationService;

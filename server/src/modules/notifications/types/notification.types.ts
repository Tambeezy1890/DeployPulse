export type CreateDiscordChannelBody = {
  projectId: string;
  name: string;
  webhookUrl: string;
};

export type UpdateNotificationChannelBody = {
  name?: string;
  enabled?: boolean;
};

export type NotificationChannelParams = {
  channelId: string;
};

export type ProjectNotificationParams = {
  projectId: string;
};

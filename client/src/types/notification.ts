export type NotificationChannelType = "DISCORD" | "SLACK";

export interface NotificationChannel {
  id: string;
  name: string;
  type: NotificationChannelType;
  enabled: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDiscordChannelData {
  name: string;
  webhookUrl: string;
}

export interface UpdateNotificationChannelData {
  name?: string;
  enabled?: boolean;
}

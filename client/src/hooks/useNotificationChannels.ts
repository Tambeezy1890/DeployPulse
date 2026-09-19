import axios from "axios";
import { useCallback, useEffect, useState } from "react";

import notificationService from "../services/notificationServices";

import type {
  CreateDiscordChannelData,
  NotificationChannel,
  UpdateNotificationChannelData,
} from "../types/notification";

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      "The notification request failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "The notification request failed.";
}

export function useNotificationChannels(projectId?: string) {
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const [updatingChannelId, setUpdatingChannelId] = useState<string | null>(
    null,
  );
  const [deletingChannelId, setDeletingChannelId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    if (!projectId) {
      setChannels([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const loadedChannels =
        await notificationService.getProjectChannels(projectId);

      setChannels(loadedChannels);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void loadChannels();
  }, [loadChannels]);

  const createDiscordChannel = useCallback(
    async (data: CreateDiscordChannelData) => {
      if (!projectId) {
        throw new Error("Project ID is required.");
      }

      setCreating(true);
      setError(null);

      try {
        const channel = await notificationService.createDiscordChannel(
          projectId,
          data,
        );

        setChannels((currentChannels) => [
          channel,
          ...currentChannels.filter(
            (currentChannel) => currentChannel.id !== channel.id,
          ),
        ]);

        return channel;
      } catch (requestError) {
        const message = getErrorMessage(requestError);

        setError(message);
        throw new Error(message);
      } finally {
        setCreating(false);
      }
    },
    [projectId],
  );

  const updateChannel = useCallback(
    async (channelId: string, data: UpdateNotificationChannelData) => {
      setUpdatingChannelId(channelId);
      setError(null);

      try {
        const updatedChannel = await notificationService.updateChannel(
          channelId,
          data,
        );

        setChannels((currentChannels) =>
          currentChannels.map((channel) =>
            channel.id === updatedChannel.id ? updatedChannel : channel,
          ),
        );

        return updatedChannel;
      } catch (requestError) {
        const message = getErrorMessage(requestError);

        setError(message);
        throw new Error(message);
      } finally {
        setUpdatingChannelId(null);
      }
    },
    [],
  );

  const testChannel = useCallback(async (channelId: string) => {
    setTestingChannelId(channelId);
    setError(null);

    try {
      return await notificationService.testChannel(channelId);
    } catch (requestError) {
      const message = getErrorMessage(requestError);

      setError(message);
      throw new Error(message);
    } finally {
      setTestingChannelId(null);
    }
  }, []);

  const deleteChannel = useCallback(async (channelId: string) => {
    setDeletingChannelId(channelId);
    setError(null);

    try {
      await notificationService.deleteChannel(channelId);

      setChannels((currentChannels) =>
        currentChannels.filter((channel) => channel.id !== channelId),
      );
    } catch (requestError) {
      const message = getErrorMessage(requestError);

      setError(message);
      throw new Error(message);
    } finally {
      setDeletingChannelId(null);
    }
  }, []);

  return {
    channels,
    loading,
    creating,
    testingChannelId,
    updatingChannelId,
    deletingChannelId,
    error,
    loadChannels,
    createDiscordChannel,
    updateChannel,
    testChannel,
    deleteChannel,
  };
}

import { useState, type FormEvent } from "react";
import {
  Bell,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useNotificationChannels } from "../../hooks/useNotificationChannels";

type NotificationChannelsPanelProps = {
  projectId: string;
};

function NotificationChannelsPanel({
  projectId,
}: NotificationChannelsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("DeployPulse Discord alerts");
  const [webhookUrl, setWebhookUrl] = useState("");

  const {
    channels,
    loading,
    creating,
    testingChannelId,
    updatingChannelId,
    deletingChannelId,
    error,
    createDiscordChannel,
    updateChannel,
    testChannel,
    deleteChannel,
  } = useNotificationChannels(projectId);

  const handleCreateChannel = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !webhookUrl.trim()) {
      toast.error("Enter a channel name and Discord webhook URL.");
      return;
    }

    try {
      await createDiscordChannel({
        name: name.trim(),
        webhookUrl: webhookUrl.trim(),
      });

      setWebhookUrl("");
      setName("DeployPulse Discord alerts");
      setShowForm(false);

      toast.success("Discord notification channel connected.");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Could not connect the Discord channel.",
      );
    }
  };

  const handleTestChannel = async (channelId: string) => {
    try {
      await testChannel(channelId);
      toast.success("Test notification sent to Discord.");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Could not send the test notification.",
      );
    }
  };

  const handleToggleChannel = async (
    channelId: string,
    currentlyEnabled: boolean,
  ) => {
    try {
      await updateChannel(channelId, {
        enabled: !currentlyEnabled,
      });

      toast.success(
        currentlyEnabled
          ? "Notification channel disabled."
          : "Notification channel enabled.",
      );
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Could not update the notification channel.",
      );
    }
  };

  const handleDeleteChannel = async (
    channelId: string,
    channelName: string,
  ) => {
    const confirmed = window.confirm(
      `Delete "${channelName}"? DeployPulse will stop sending alerts to this channel.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteChannel(channelId);
      toast.success("Notification channel deleted.");
    } catch (requestError) {
      toast.error(
        requestError instanceof Error
          ? requestError.message
          : "Could not delete the notification channel.",
      );
    }
  };

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <header className="flex flex-col gap-4 border-b border-slate-800 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
            <Bell size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-white">Notification channels</h2>

            <p className="mt-1 text-sm text-slate-400">
              Send incident and recovery alerts to your team.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
        >
          <Plus size={16} />

          {showForm ? "Cancel" : "Connect Discord"}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={handleCreateChannel}
          className="border-b border-slate-800 bg-slate-950/30 p-6"
        >
          <div className="grid gap-5">
            <div>
              <label
                htmlFor="notification-channel-name"
                className="text-sm font-medium text-slate-200"
              >
                Channel name
              </label>

              <input
                id="notification-channel-name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Production Discord alerts"
                maxLength={100}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="discord-webhook-url"
                className="text-sm font-medium text-slate-200"
              >
                Discord webhook URL
              </label>

              <input
                id="discord-webhook-url"
                type="password"
                value={webhookUrl}
                onChange={(event) => setWebhookUrl(event.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                autoComplete="off"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
              />

              <p className="mt-2 text-xs text-slate-500">
                The webhook is encrypted before it is stored and will not be
                displayed again.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <MessageCircle size={16} />
                    Connect Discord
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {error && (
        <div className="border-b border-red-500/20 bg-red-500/5 px-6 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
            <Loader2 size={17} className="animate-spin" />
            Loading notification channels...
          </div>
        ) : channels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/30 px-6 py-10 text-center">
            <Bell size={28} className="mx-auto text-slate-600" />

            <h3 className="mt-3 font-medium text-slate-200">
              No notification channels
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
              Connect Discord to receive alerts when incidents are opened,
              updated, or resolved.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {channels.map((channel) => {
              const testing = testingChannelId === channel.id;
              const updating = updatingChannelId === channel.id;
              const deleting = deletingChannelId === channel.id;

              return (
                <article
                  key={channel.id}
                  className="flex flex-col gap-5 rounded-xl border border-slate-800 bg-slate-950/40 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                      <MessageCircle size={19} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-medium text-white">
                          {channel.name}
                        </h3>

                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                            channel.enabled
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                              : "border-slate-700 bg-slate-800 text-slate-400"
                          }`}
                        >
                          {channel.enabled ? "Enabled" : "Disabled"}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle2 size={13} />
                          Discord
                        </span>

                        <span>
                          Connected{" "}
                          {new Date(channel.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="mr-2 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400">
                      <input
                        type="checkbox"
                        checked={channel.enabled}
                        disabled={updating}
                        onChange={() =>
                          void handleToggleChannel(channel.id, channel.enabled)
                        }
                        className="h-4 w-4 accent-indigo-500"
                      />

                      {updating ? "Saving..." : "Enabled"}
                    </label>

                    <button
                      type="button"
                      disabled={!channel.enabled || testing}
                      onClick={() => void handleTestChannel(channel.id)}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {testing ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Send size={15} />
                      )}
                      Test
                    </button>

                    <button
                      type="button"
                      disabled={deleting}
                      onClick={() =>
                        void handleDeleteChannel(channel.id, channel.name)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deleting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default NotificationChannelsPanel;

import { ApiError } from "../../../utils/ApiError.js";

type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

type SendDiscordWebhookOptions = {
  webhookUrl: string;
  title: string;
  description: string;
  color?: number;
  fields?: DiscordEmbedField[];
  timestamp?: Date;
};

function validateDiscordWebhookUrl(webhookUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(webhookUrl);
  } catch {
    throw new ApiError("Discord webhook URL is invalid.", 422);
  }

  const allowedHosts = new Set([
    "discord.com",
    "www.discord.com",
    "discordapp.com",
    "www.discordapp.com",
  ]);

  if (
    parsedUrl.protocol !== "https:" ||
    !allowedHosts.has(parsedUrl.hostname) ||
    !parsedUrl.pathname.startsWith("/api/webhooks/")
  ) {
    throw new ApiError("A valid Discord webhook URL is required.", 422);
  }

  return parsedUrl;
}

export async function sendDiscordWebhook({
  webhookUrl,
  title,
  description,
  color = 5_795_967,
  fields = [],
  timestamp = new Date(),
}: SendDiscordWebhookOptions) {
  const parsedUrl = validateDiscordWebhookUrl(webhookUrl);

  /*
   * wait=true makes Discord return the created message.
   * This allows DeployPulse to know whether delivery succeeded.
   */
  parsedUrl.searchParams.set("wait", "true");

  const response = await fetch(parsedUrl.toString(), {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      username: "DeployPulse",

      allowed_mentions: {
        parse: [],
      },

      embeds: [
        {
          title,
          description,
          color,

          fields: fields.map((field) => ({
            name: field.name,
            value: field.value,
            inline: field.inline ?? false,
          })),

          footer: {
            text: "DeployPulse monitoring",
          },

          timestamp: timestamp.toISOString(),
        },
      ],
    }),

    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const responseBody = await response.text();

    throw new ApiError(
      `Discord rejected the notification with status ${response.status}: ${responseBody.slice(
        0,
        200,
      )}`,
      502,
    );
  }

  return response.json() as Promise<{
    id: string;
    channel_id: string;
  }>;
}

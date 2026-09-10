import { body, param } from "express-validator";

export const projectNotificationParamsValidator = [
  param("projectId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Project ID is required."),
];

export const notificationChannelParamsValidator = [
  param("channelId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Notification channel ID is required."),
];

export const createDiscordChannelValidator = [
  ...projectNotificationParamsValidator,

  body("name")
    .isString()
    .withMessage("Channel name must be text.")
    .trim()
    .isLength({
      min: 1,
      max: 100,
    })
    .withMessage("Channel name must contain between 1 and 100 characters."),

  body("webhookUrl")
    .isString()
    .withMessage("Discord webhook URL must be text.")
    .trim()
    .isURL({
      protocols: ["https"],
      require_protocol: true,
    })
    .withMessage("A valid HTTPS Discord webhook URL is required."),
];

export const updateNotificationChannelValidator = [
  ...notificationChannelParamsValidator,

  body().custom((value) => {
    if (value.name === undefined && value.enabled === undefined) {
      throw new Error("Provide a name or enabled value to update.");
    }

    return true;
  }),

  body("name")
    .optional()
    .isString()
    .withMessage("Channel name must be text.")
    .trim()
    .isLength({
      min: 1,
      max: 100,
    })
    .withMessage("Channel name must contain between 1 and 100 characters."),

  body("enabled")
    .optional()
    .isBoolean()
    .withMessage("Enabled must be true or false."),
];

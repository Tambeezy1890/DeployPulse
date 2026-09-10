import { Router } from "express";

import protect from "../../auth/middleware/protect.js";

import { validateRequest } from "../../../middleware/validateRequest.js";

import {
  createDiscordChannel,
  getProjectNotificationChannels,
} from "../controller/notification.controller.js";

import {
  createDiscordChannelValidator,
  projectNotificationParamsValidator,
} from "../validators/notification.validators.js";

const projectNotificationRouter = Router({
  mergeParams: true,
});

projectNotificationRouter.use(protect);

projectNotificationRouter.get(
  "/",
  projectNotificationParamsValidator,
  validateRequest,
  getProjectNotificationChannels,
);

projectNotificationRouter.post(
  "/discord",
  createDiscordChannelValidator,
  validateRequest,
  createDiscordChannel,
);

export default projectNotificationRouter;

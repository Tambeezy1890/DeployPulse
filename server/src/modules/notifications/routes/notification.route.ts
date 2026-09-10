import { Router } from "express";

import protect from "../../auth/middleware/protect.js";

import { validateRequest } from "../../../middleware/validateRequest.js";

import {
  deleteNotificationChannel,
  testNotificationChannel,
  updateNotificationChannel,
} from "../controller/notification.controller.js";

import {
  notificationChannelParamsValidator,
  updateNotificationChannelValidator,
} from "../validators/notification.validators.js";

const notificationRouter = Router();

notificationRouter.use(protect);

notificationRouter.post(
  "/:channelId/test",
  notificationChannelParamsValidator,
  validateRequest,
  testNotificationChannel,
);

notificationRouter.patch(
  "/:channelId",
  updateNotificationChannelValidator,
  validateRequest,
  updateNotificationChannel,
);

notificationRouter.delete(
  "/:channelId",
  notificationChannelParamsValidator,
  validateRequest,
  deleteNotificationChannel,
);

export default notificationRouter;

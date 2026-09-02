import express, { Router } from "express";

import { handleGitHubWebhook } from "../controller/githubWebhook.controller.js";

const githubWebhookRouter = Router();

githubWebhookRouter.post(
  "/",
  express.raw({
    type: "application/json",
    limit: "1mb",
  }),
  handleGitHubWebhook,
);

export default githubWebhookRouter;

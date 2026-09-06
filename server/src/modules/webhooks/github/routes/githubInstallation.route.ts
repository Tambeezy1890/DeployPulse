import { Router } from "express";

import {
  finishGitHubInstallation,
  getGitHubInstallationUrl,
  listGitHubInstallations,
} from "../controller/githubInstallation.controller.js";
import protect from "../../../auth/middleware/protect.js";

const githubInstallationRouter = Router();

githubInstallationRouter.use(protect);

githubInstallationRouter.get("/install-url", getGitHubInstallationUrl);

githubInstallationRouter.post(
  "/installations/complete",
  finishGitHubInstallation,
);

githubInstallationRouter.get("/installations", listGitHubInstallations);

export default githubInstallationRouter;

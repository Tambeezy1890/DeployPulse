import { Router } from "express";

import {
  deleteDeployment,
  getDeploymentById,
  updateDeploymentStatus,
} from "../controller/deployment.controller.js";

import protect from "../../auth/middleware/protect.js";

import {
  deploymentIdValidator,
  updateDeploymentStatusValidator,
} from "../validators/deployment.validators.js";

import { validateRequest } from "../../../middleware/validateRequest.js";

const deploymentRouter = Router();

deploymentRouter.use(protect);

deploymentRouter.get(
  "/:deploymentId",
  deploymentIdValidator,
  validateRequest,
  getDeploymentById,
);

deploymentRouter.patch(
  "/:deploymentId/status",
  deploymentIdValidator,
  updateDeploymentStatusValidator,
  validateRequest,
  updateDeploymentStatus,
);

deploymentRouter.delete(
  "/:deploymentId",
  deploymentIdValidator,
  validateRequest,
  deleteDeployment,
);

export default deploymentRouter;

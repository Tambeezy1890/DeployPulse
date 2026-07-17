import { Router } from "express";
import {
  createDeployment,
  getProjectDeployments,
} from "../controller/deployment.controller.js";
import {
  createDeploymentValidator,
  projectIdValidator,
} from "../validators/deployment.validators.js";
import protect from "../../auth/middleware/protect.js";
import { validateRequest } from "../../../middleware/validateRequest.js";

const projectDeploymentRouter = Router({
  mergeParams: true,
});

projectDeploymentRouter.use(protect);

projectDeploymentRouter.get(
  "/",
  projectIdValidator,
  validateRequest,
  getProjectDeployments,
);

projectDeploymentRouter.post(
  "/",
  projectIdValidator,
  createDeploymentValidator,
  validateRequest,
  createDeployment,
);

export default projectDeploymentRouter;

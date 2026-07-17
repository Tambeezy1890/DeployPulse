import { Router } from "express";
import protect from "../../auth/middleware/protect.js";

import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../controller/project.controller.js";

import {
  createProjectValidator,
  projectIdValidator,
  updateProjectValidator,
} from "../validators/project.validators.js";

import type {
  CreateProjectBody,
  ProjectParams,
  UpdateProjectBody,
} from "../types/project.types.js";
import { validateRequest } from "../../../middleware/validateRequest.js";

const projectRouter = Router();

projectRouter.use(protect);

projectRouter.get("/", getProjects);

projectRouter.get<ProjectParams>(
  "/:id",
  projectIdValidator,
  validateRequest,
  getProjectById,
);

projectRouter.post<{}, unknown, CreateProjectBody>(
  "/",
  createProjectValidator,
  validateRequest,
  createProject,
);

projectRouter.patch<ProjectParams, unknown, UpdateProjectBody>(
  "/:id",
  updateProjectValidator,
  validateRequest,
  updateProject,
);

projectRouter.delete<ProjectParams>(
  "/:id",
  projectIdValidator,
  validateRequest,
  deleteProject,
);

export default projectRouter;

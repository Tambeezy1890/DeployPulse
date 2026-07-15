import { Router } from "express";
import protect from "../../auth/middleware/protect.js";
import {
  createProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from "../controller/project.controller.js";

const projectRouter = Router();

projectRouter.use(protect);

projectRouter.get("/projects", getProjects);
projectRouter.get("/project/:id", getProjectById);
projectRouter.post("/project", createProject);
projectRouter.patch("/project/:id", updateProject);
projectRouter.delete("/project/:id", deleteProject);

export default projectRouter;

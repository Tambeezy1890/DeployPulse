import asyncHandler from "../../../utils/AsyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import type {
  CreateProjectBody,
  ProjectParams,
  UpdateProjectBody,
} from "../types/project.types.js";
import {
  createProjectService,
  deleteProjectService,
  getOwnedProjectService,
  getProjectsService,
  updateProjectService,
} from "../services/project.service.js";

export const createProject = asyncHandler<{}, unknown, CreateProjectBody>(
  async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const project = await createProjectService(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Project created successfully.",
      data: project,
    });
  },
);

export const getProjects = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const projects = await getProjectsService(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Projects fetched successfully.",
    data: projects,
  });
});

export const getProjectById = asyncHandler<ProjectParams>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const project = await getOwnedProjectService(req.params.id, req.user.id);

  return res.status(200).json({
    success: true,
    message: "Project fetched successfully.",
    data: project,
  });
});

export const updateProject = asyncHandler<
  ProjectParams,
  unknown,
  UpdateProjectBody
>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const project = await updateProjectService(
    req.params.id,
    req.user.id,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Project updated successfully.",
    data: project,
  });
});

export const deleteProject = asyncHandler<ProjectParams>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  await deleteProjectService(req.params.id, req.user.id);

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully.",
  });
});

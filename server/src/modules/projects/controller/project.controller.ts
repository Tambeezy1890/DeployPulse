import asyncHandler from "../../../utils/AsyncHandler.js";
import type { Request, Response } from "express";
import { ProjectBody, ProjectParams } from "../types/project.types.js";
import prisma from "../../../config/prisma.js";
import { ApiError } from "../../../utils/ApiError.js";

export const createProject = asyncHandler(
  async (req: Request<{}, {}, ProjectBody>, res: Response) => {
    const { name, description, repository, provider } = req.body;
    if (!req.user) {
      throw new ApiError("Authentication required", 401);
    }
    const slug = name
      .trim()
      .toLocaleLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    const project = await prisma.project.create({
      data: {
        name,
        slug,
        description,
        repository,
        provider,
        ownerId: req.user.id,
      },
    });
    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  },
);

export const getProjects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError("Authentication required", 401);
  }
  const projects = await prisma.project.findMany({
    where: { ownerId: req.user.id },
  });
  res.status(200).json({
    success: true,
    message: "Projects fetched successfully",
    data: projects,
  });
});

export const getProjectById = asyncHandler<ProjectParams>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const project = await prisma.project.findUnique({
    where: {
      id: req.params.id,
    },
  });

  if (!project || project.ownerId !== req.user.id) {
    throw new ApiError("Project not found.", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Project fetched successfully.",
    data: project,
  });
});

export const updateProject = asyncHandler<ProjectParams, {}, ProjectBody>(
  async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const { id } = req.params;
    const { name, description, repository, provider } = req.body;

    const project = await prisma.project.findFirst({
      where: {
        id,
        ownerId: req.user.id,
      },
    });

    if (!project) {
      throw new ApiError("Project not found.", 404);
    }

    const slug = name
      ? name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/^-+|-+$/g, "")
      : project.slug;

    const updatedProject = await prisma.project.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        description,
        repository,
        provider,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      data: updatedProject,
    });
  },
);
export const deleteProject = asyncHandler<ProjectParams>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const { id } = req.params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      ownerId: req.user.id,
    },
  });

  if (!project) {
    throw new ApiError("Project not found.", 404);
  }

  await prisma.project.delete({
    where: {
      id,
    },
  });

  return res.status(200).json({
    success: true,
    message: "Project deleted successfully.",
  });
});

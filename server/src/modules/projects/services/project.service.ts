import prisma from "../../../config/prisma.js";
import { ApiError } from "../../../utils/ApiError.js";
import type {
  CreateProjectBody,
  UpdateProjectBody,
} from "../types/project.types.js";

const generateSlug = (name: string): string => {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
};

export const createProjectService = async (
  ownerId: string,
  data: CreateProjectBody,
) => {
  const slug = generateSlug(data.name);

  if (!slug) {
    throw new ApiError("Project name must contain letters or numbers.", 422);
  }

  const existingProject = await prisma.project.findUnique({
    where: {
      ownerId_slug: {
        ownerId,
        slug,
      },
    },
  });

  if (existingProject) {
    throw new ApiError("You already have a project with this name.", 409);
  }

  return prisma.project.create({
    data: {
      name: data.name.trim(),
      slug,
      description: data.description?.trim(),
      repository: data.repository?.trim(),
      provider: data.provider,
      ownerId,
    },
  });
};

export const getProjectsService = async (ownerId: string) => {
  return prisma.project.findMany({
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getOwnedProjectService = async (
  projectId: string,
  ownerId: string,
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId,
    },
  });

  if (!project) {
    throw new ApiError("Project not found.", 404);
  }

  return project;
};

export const updateProjectService = async (
  projectId: string,
  ownerId: string,
  data: UpdateProjectBody,
) => {
  const project = await getOwnedProjectService(projectId, ownerId);

  let slug = project.slug;

  if (data.name !== undefined) {
    slug = generateSlug(data.name);

    if (!slug) {
      throw new ApiError("Project name must contain letters or numbers.", 422);
    }

    const conflictingProject = await prisma.project.findFirst({
      where: {
        ownerId,
        slug,
        id: {
          not: projectId,
        },
      },
    });

    if (conflictingProject) {
      throw new ApiError(
        "You already have another project with this name.",
        409,
      );
    }
  }

  return prisma.project.update({
    where: {
      id: projectId,
    },
    data: {
      name: data.name !== undefined ? data.name.trim() : undefined,
      slug,
      description: data.description === null ? null : data.description?.trim(),
      repository: data.repository === null ? null : data.repository?.trim(),
      provider: data.provider,
    },
  });
};

export const deleteProjectService = async (
  projectId: string,
  ownerId: string,
) => {
  await getOwnedProjectService(projectId, ownerId);

  await prisma.project.delete({
    where: {
      id: projectId,
    },
  });
};

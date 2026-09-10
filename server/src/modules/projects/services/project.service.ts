import prisma from "../../../config/prisma.js";
import { ApiError } from "../../../utils/ApiError.js";
import type {
  CreateProjectBody,
  UpdateProjectBody,
} from "../types/project.types.js";
import { getGitHubRepoFullName } from "../utils/githubRepository.js";

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

  const githubRepository = data.githubRepositoryId
    ? await prisma.gitHubRepository.findFirst({
        where: {
          id: data.githubRepositoryId,
          active: true,
          installation: {
            ownerId,
          },
        },
        select: {
          id: true,
          fullName: true,
          htmlUrl: true,
        },
      })
    : null;

  if (data.githubRepositoryId && !githubRepository) {
    throw new ApiError(
      "GitHub repository was not found or does not belong to you.",
      404,
    );
  }

  const manualRepository = data.repository?.trim() || null;
  const healthCheckUrl = data.healthCheckUrl?.trim() || null;

  return prisma.project.create({
    data: {
      name: data.name.trim(),
      slug,

      description: data.description?.trim() || null,

      /*
       * A connected GitHub repository is the source of truth.
       * Manual repository URLs remain supported as a fallback.
       */
      repository: githubRepository?.htmlUrl ?? manualRepository,

      githubRepoFullName:
        githubRepository?.fullName.toLowerCase() ??
        getGitHubRepoFullName(manualRepository),

      githubRepositoryId: githubRepository?.id ?? null,

      provider: data.provider,
      ownerId,

      healthCheckUrl,

      /*
       * Monitoring cannot be enabled without an endpoint.
       */
      monitoringEnabled:
        Boolean(healthCheckUrl) && (data.monitoringEnabled ?? false),
    },

    include: {
      githubRepository: true,
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

  let connectedRepository:
    | {
        id: string;
        fullName: string;
        htmlUrl: string;
      }
    | null
    | undefined;

  /*
   * undefined = repository selection was not changed
   * null = disconnect the current GitHub repository
   * string = connect the selected GitHub repository
   */
  if (data.githubRepositoryId === null) {
    connectedRepository = null;
  }

  if (typeof data.githubRepositoryId === "string") {
    connectedRepository = await prisma.gitHubRepository.findFirst({
      where: {
        id: data.githubRepositoryId,
        active: true,
        installation: {
          ownerId,
        },
      },
      select: {
        id: true,
        fullName: true,
        htmlUrl: true,
      },
    });

    if (!connectedRepository) {
      throw new ApiError(
        "GitHub repository was not found or does not belong to you.",
        404,
      );
    }
  }

  const nextManualRepository =
    data.repository === undefined ? project.repository : data.repository;

  return prisma.project.update({
    where: {
      id: projectId,
    },

    data: {
      name: data.name !== undefined ? data.name.trim() : undefined,

      slug,

      description: data.description === null ? null : data.description?.trim(),

      provider: data.provider,

      healthCheckUrl:
        data.healthCheckUrl === null ? null : data.healthCheckUrl?.trim(),

      monitoringEnabled: data.monitoringEnabled,

      /*
       * When githubRepositoryId is provided, the selected GitHub
       * repository becomes the source of truth.
       */
      ...(data.githubRepositoryId !== undefined
        ? {
            githubRepository: connectedRepository
              ? {
                  connect: {
                    id: connectedRepository.id,
                  },
                }
              : {
                  disconnect: true,
                },

            repository: connectedRepository?.htmlUrl ?? null,

            githubRepoFullName:
              connectedRepository?.fullName.toLowerCase() ?? null,
          }
        : {
            /*
             * Keep supporting manually entered repository URLs
             * until the create-project page is converted too.
             */
            repository:
              data.repository === undefined
                ? undefined
                : data.repository === null
                  ? null
                  : data.repository.trim(),

            githubRepoFullName:
              data.repository === undefined
                ? undefined
                : getGitHubRepoFullName(nextManualRepository),
          }),
    },

    include: {
      githubRepository: true,
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

import { useMemo } from "react";

import type { Deployment } from "../types/deployment";
import type { Project } from "../types/project";

export function useDashboardView(
  projects: Project[],
  deployments: Deployment[],
  search: string,
) {
  const filteredProjects = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return projects;
    }

    return projects.filter((project) => {
      const searchableValues = [
        project.name,
        project.description,
        project.repository,
        project.githubRepoFullName,
        project.provider,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(searchValue),
      );
    });
  }, [projects, search]);

  const metrics = useMemo(() => {
    const latestDeploymentByProject = new Map<string, Deployment>();

    for (const deployment of deployments) {
      const current = latestDeploymentByProject.get(deployment.projectId);

      if (
        !current ||
        new Date(deployment.createdAt).getTime() >
          new Date(current.createdAt).getTime()
      ) {
        latestDeploymentByProject.set(deployment.projectId, deployment);
      }
    }

    const failedDeployments = deployments.filter(
      (deployment) => deployment.status === "FAILED",
    ).length;

    const healthyProjects = projects.filter(
      (project) =>
        latestDeploymentByProject.get(project.id)?.status === "SUCCESS",
    ).length;

    return {
      totalProjects: projects.length,
      totalDeployments: deployments.length,
      failedDeployments,
      healthyProjects,
    };
  }, [projects, deployments]);

  return {
    filteredProjects,
    metrics,
  };
}

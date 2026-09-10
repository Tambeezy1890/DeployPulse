import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import deploymentService from "../services/deploymentServices";

import type { Deployment } from "../types/deployment";
import type { Project } from "../types/project";

const DASHBOARD_POLL_INTERVAL = 15_000;

export function useDashboardDeployments(projects: Project[]) {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const requestInProgressRef = useRef(false);

  const projectIds = useMemo(
    () => projects.map((project) => project.id),
    [projects],
  );

  const projectIdsKey = projectIds.join(",");

  const loadDeployments = useCallback(async () => {
    if (requestInProgressRef.current) {
      return;
    }

    if (!projectIdsKey) {
      setDeployments([]);
      setHasLoaded(true);
      setLastUpdatedAt(new Date());
      return;
    }

    requestInProgressRef.current = true;

    if (!hasLoaded) {
      setLoading(true);
    }

    try {
      const ids = projectIdsKey.split(",");

      const results = await Promise.allSettled(
        ids.map((projectId) => deploymentService.getDeployments(projectId)),
      );

      const nextDeployments = results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : [],
      );

      setDeployments(nextDeployments);
      setLastUpdatedAt(new Date());
    } catch (error) {
      console.error("Failed to load dashboard deployments:", error);
    } finally {
      setHasLoaded(true);
      setLoading(false);
      requestInProgressRef.current = false;
    }
  }, [hasLoaded, projectIdsKey]);

  useEffect(() => {
    void loadDeployments();

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadDeployments();
      }
    }, DASHBOARD_POLL_INTERVAL);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadDeployments();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadDeployments]);

  const removeProjectDeployments = useCallback((projectId: string) => {
    setDeployments((current) =>
      current.filter((deployment) => deployment.projectId !== projectId),
    );
  }, []);

  return {
    deployments,
    loading,
    hasLoaded,
    lastUpdatedAt,
    loadDeployments,
    removeProjectDeployments,
  };
}

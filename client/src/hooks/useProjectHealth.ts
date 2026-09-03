import { useCallback, useEffect, useState } from "react";

import healthService from "../services/healthServices";
import type { ProjectHealth } from "../types/health";

export function useProjectHealth(
  projectId: string | undefined,
  monitoringEnabled: boolean,
) {
  const [health, setHealth] = useState<ProjectHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const loadHealth = useCallback(async () => {
    if (!projectId) return;

    try {
      setHealthLoading(true);

      const healthData = await healthService.getProjectHealth(projectId);

      setHealth(healthData);
    } catch (error) {
      console.error("Failed to load project health:", error);
    } finally {
      setHealthLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    void loadHealth();

    if (!monitoringEnabled) return;

    const intervalId = window.setInterval(() => {
      void loadHealth();
    }, 15_000);

    return () => window.clearInterval(intervalId);
  }, [projectId, monitoringEnabled, loadHealth]);

  return {
    health,
    healthLoading,
    loadHealth,
  };
}

import { useCallback, useEffect, useState } from "react";

import { useProject } from "../contexts/ProjectContext";
import { useDeployment } from "../contexts/DeploymentContext";
import { useProjectHealth } from "./useProjectHealth";

export function useProjectDetails(projectId: string | undefined) {
  const {
    selectedProject: project,
    loading: projectLoading,
    getProjectById,
  } = useProject();

  const {
    deployments,
    loading: deploymentLoading,
    getDeployments,
    deleteDeployment,
  } = useDeployment();

  const [deploymentIdToDelete, setDeploymentIdToDelete] = useState<
    string | null
  >(null);

  const [deletingDeployment, setDeletingDeployment] = useState(false);

  const { health, healthLoading, loadHealth } = useProjectHealth(
    projectId,
    project?.monitoringEnabled ?? false,
  );

  useEffect(() => {
    if (!projectId) return;

    void getProjectById(projectId);
    void getDeployments(projectId);
  }, [projectId, getProjectById, getDeployments]);

  useEffect(() => {
    if (!projectId) return;

    const hasActiveDeployment = deployments.some(
      (deployment) =>
        deployment.status === "PENDING" || deployment.status === "RUNNING",
    );

    if (!hasActiveDeployment) return;

    const intervalId = window.setInterval(() => {
      void getDeployments(projectId);
    }, 1_500);

    return () => window.clearInterval(intervalId);
  }, [deployments, projectId, getDeployments]);

  const handleRefresh = useCallback(async () => {
    if (!projectId) return;

    await Promise.all([getDeployments(projectId), loadHealth()]);
  }, [projectId, getDeployments, loadHealth]);

  const requestDeploymentDelete = useCallback((deploymentId: string) => {
    setDeploymentIdToDelete(deploymentId);
  }, []);

  const cancelDeploymentDelete = useCallback(() => {
    if (deletingDeployment) return;

    setDeploymentIdToDelete(null);
  }, [deletingDeployment]);

  const confirmDeploymentDelete = useCallback(async () => {
    if (!projectId || !deploymentIdToDelete) return;

    const deploymentId = deploymentIdToDelete;

    // Close the modal immediately.
    setDeploymentIdToDelete(null);
    setDeletingDeployment(true);

    try {
      await deleteDeployment(projectId, deploymentId);
    } finally {
      setDeletingDeployment(false);
    }
  }, [projectId, deploymentIdToDelete, deleteDeployment]);

  const deploymentToDelete =
    deployments.find((deployment) => deployment.id === deploymentIdToDelete) ??
    null;

  return {
    project,
    projectLoading,

    deployments,
    deploymentLoading,

    health,
    healthLoading,
    loadHealth,

    handleRefresh,

    deploymentToDelete,
    deletingDeployment,
    requestDeploymentDelete,
    cancelDeploymentDelete,
    confirmDeploymentDelete,
  };
}

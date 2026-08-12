import { useCallback, useState, type ReactNode } from "react";

import toast from "react-hot-toast";

import { DeploymentContext } from "./DeploymentContext";

import deploymentService from "../services/deploymentServices";

import type { CreateDeploymentData, Deployment } from "../types/deployment";

type DeploymentProviderProps = {
  children: ReactNode;
};

export const DeploymentProvider = ({ children }: DeploymentProviderProps) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);

  const [selectedDeployment, setSelectedDeployment] =
    useState<Deployment | null>(null);

  const [loading, setLoading] = useState(false);

  const getDeployments = useCallback(async (projectId: string) => {
    setLoading(true);

    try {
      const data = await deploymentService.getDeployments(projectId);

      setDeployments(data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load deployments");
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeploymentById = useCallback(
    async (
      projectId: string,
      deploymentId: string,
    ): Promise<Deployment | null> => {
      setLoading(true);

      try {
        const deployment = await deploymentService.getDeploymentById(
          projectId,
          deploymentId,
        );

        setSelectedDeployment(deployment);

        return deployment;
      } catch (error) {
        console.error(error);
        toast.error("Failed to load deployment");

        setSelectedDeployment(null);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createDeployment = async (
    projectId: string,
    data: CreateDeploymentData,
  ): Promise<Deployment> => {
    const deployment = await deploymentService.createDeployment(
      projectId,
      data,
    );

    setDeployments((previous) => [deployment, ...previous]);

    toast.success("Deployment started");

    return deployment;
  };

  const deleteDeployment = async (projectId: string, deploymentId: string) => {
    await deploymentService.deleteDeployment(projectId, deploymentId);

    setDeployments((previous) =>
      previous.filter((deployment) => deployment.id !== deploymentId),
    );

    toast.success("Deployment deleted");
  };

  return (
    <DeploymentContext.Provider
      value={{
        deployments,
        selectedDeployment,
        loading,
        getDeployments,
        getDeploymentById,
        createDeployment,
        deleteDeployment,
      }}
    >
      {children}
    </DeploymentContext.Provider>
  );
};

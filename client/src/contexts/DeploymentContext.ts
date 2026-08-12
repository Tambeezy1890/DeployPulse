import { createContext, useContext } from "react";

import type { CreateDeploymentData, Deployment } from "../types/deployment";

export type DeploymentContextType = {
  deployments: Deployment[];
  selectedDeployment: Deployment | null;
  loading: boolean;

  getDeployments: (projectId: string) => Promise<void>;

  getDeploymentById: (
    projectId: string,
    deploymentId: string,
  ) => Promise<Deployment | null>;

  createDeployment: (
    projectId: string,
    data: CreateDeploymentData,
  ) => Promise<Deployment>;

  deleteDeployment: (projectId: string, deploymentId: string) => Promise<void>;
};

export const DeploymentContext = createContext<
  DeploymentContextType | undefined
>(undefined);

export const useDeployment = () => {
  const context = useContext(DeploymentContext);

  if (!context) {
    throw new Error("useDeployment must be used inside DeploymentProvider");
  }

  return context;
};

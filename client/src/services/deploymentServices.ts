import api from "./api";

import type {
  CreateDeploymentData,
  Deployment,
  UpdateDeploymentStatusData,
} from "../types/deployment";

interface DeploymentResponse {
  success: boolean;
  message: string;
  deployment: Deployment;
}

interface DeploymentsResponse {
  success: boolean;
  message: string;
  deployments: Deployment[];
}

const deploymentService = {
  async getDeployments(projectId: string): Promise<Deployment[]> {
    const response = await api.get<DeploymentsResponse>(
      `/projects/${projectId}/deployments`,
    );

    return response.data.deployments;
  },

  async getDeploymentById(
    projectId: string,
    deploymentId: string,
  ): Promise<Deployment> {
    const response = await api.get<DeploymentResponse>(
      `/projects/${projectId}/deployments/${deploymentId}`,
    );

    return response.data.deployment;
  },

  async createDeployment(
    projectId: string,
    data: CreateDeploymentData,
  ): Promise<Deployment> {
    const response = await api.post<DeploymentResponse>(
      `/projects/${projectId}/deployments`,
      data,
    );

    return response.data.deployment;
  },

  async updateDeploymentStatus(
    projectId: string,
    deploymentId: string,
    data: UpdateDeploymentStatusData,
  ): Promise<Deployment> {
    const response = await api.patch<DeploymentResponse>(
      `/projects/${projectId}/deployments/${deploymentId}/status`,
      data,
    );

    return response.data.deployment;
  },

  async deleteDeployment(
    projectId: string,
    deploymentId: string,
  ): Promise<void> {
    await api.delete(`/projects/${projectId}/deployments/${deploymentId}`);
  },
};

export default deploymentService;

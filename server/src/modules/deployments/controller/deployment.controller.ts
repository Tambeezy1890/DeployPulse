import asyncHandler from "../../../utils/AsyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";

import type {
  CreateDeploymentBody,
  DeploymentParams,
  ProjectDeploymentParams,
  UpdateDeploymentStatusBody,
} from "../types/deployment.types.js";

import {
  createDeploymentService,
  deleteDeploymentService,
  getDeploymentByIdService,
  getDeploymentsService,
  updateDeploymentStatusService,
} from "../services/deployment.service.js";

export const createDeployment = asyncHandler<
  ProjectDeploymentParams,
  unknown,
  CreateDeploymentBody
>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const deployment = await createDeploymentService(
    req.params.projectId,
    req.user.id,
    req.body,
  );

  return res.status(201).json({
    success: true,
    message: "Deployment created successfully.",
    data: deployment,
  });
});

export const getProjectDeployments = asyncHandler<ProjectDeploymentParams>(
  async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const deployments = await getDeploymentsService(
      req.params.projectId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Deployments fetched successfully.",
      data: deployments,
    });
  },
);

export const getDeploymentById = asyncHandler<DeploymentParams>(
  async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const deployment = await getDeploymentByIdService(
      req.user.id,
      req.params.deploymentId,
    );

    return res.status(200).json({
      success: true,
      message: "Deployment fetched successfully.",
      data: deployment,
    });
  },
);

export const updateDeploymentStatus = asyncHandler<
  DeploymentParams,
  unknown,
  UpdateDeploymentStatusBody
>(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const updatedDeployment = await updateDeploymentStatusService(
    req.user.id,
    req.params.deploymentId,
    req.body,
  );

  return res.status(200).json({
    success: true,
    message: "Deployment status updated successfully.",
    data: updatedDeployment,
  });
});

export const deleteDeployment = asyncHandler<DeploymentParams>(
  async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    await deleteDeploymentService(req.user.id, req.params.deploymentId);

    return res.status(200).json({
      success: true,
      message: "Deployment deleted successfully.",
    });
  },
);

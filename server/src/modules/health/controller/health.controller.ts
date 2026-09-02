import type { Request, Response } from "express";

import asyncHandler from "../../../utils/AsyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { getProjectHealthChecks } from "../services/health.service.js";

export const getProjectHealthChecksController = asyncHandler(
  async (req: Request, res: Response) => {
    const rawProjectId = req.params.projectId;

    const projectId = Array.isArray(rawProjectId)
      ? rawProjectId[0]
      : rawProjectId;

    if (!projectId) {
      throw new ApiError("Project ID is required.", 400);
    }

    const ownerId = req.user.id;

    const health = await getProjectHealthChecks(projectId, ownerId);

    res.status(200).json({
      success: true,
      health,
    });
  },
);

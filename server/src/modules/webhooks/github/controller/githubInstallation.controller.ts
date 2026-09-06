import type { Request, Response } from "express";

import {
  completeGitHubInstallation,
  createGitHubInstallationUrl,
  getUserGitHubInstallations,
} from "../services/githubInstallation.service.js";
import asyncHandler from "../../../../utils/AsyncHandler.js";
import { ApiError } from "../../../../utils/ApiError.js";

type CompleteInstallationBody = {
  installationId?: string;
  state?: string;
};

export const getGitHubInstallationUrl = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const installUrl = createGitHubInstallationUrl(req.user.id);

    return res.status(200).json({
      success: true,
      installUrl,
    });
  },
);

export const finishGitHubInstallation = asyncHandler(
  async (req: Request<{}, {}, CompleteInstallationBody>, res: Response) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const installationId = req.body.installationId?.trim();

    const state = req.body.state?.trim();

    if (!installationId || !/^\d+$/.test(installationId)) {
      throw new ApiError("A valid GitHub installation ID is required.", 422);
    }

    if (!state) {
      throw new ApiError("GitHub installation state is required.", 422);
    }

    const installation = await completeGitHubInstallation({
      userId: req.user.id,
      installationId,
      state,
    });

    return res.status(200).json({
      success: true,
      message: "GitHub connected successfully.",
      installation,
    });
  },
);

export const listGitHubInstallations = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const installations = await getUserGitHubInstallations(req.user.id);

    return res.status(200).json({
      success: true,
      installations,
    });
  },
);

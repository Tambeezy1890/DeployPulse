import asyncHandler from "../../../utils/AsyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";

import {
  getIncidentByIdService,
  getIncidentsService,
  manuallyResolveIncidentService,
} from "../services/incidentCorrelation.service.js";

import type { IncidentParams } from "../types/incident.types.js";

export const getIncidents = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError("Authentication required.", 401);
  }

  const requestedStatus = req.query.status;

  if (
    requestedStatus !== undefined &&
    requestedStatus !== "OPEN" &&
    requestedStatus !== "RESOLVED"
  ) {
    throw new ApiError("Incident status must be OPEN or RESOLVED.", 422);
  }

  const incidents = await getIncidentsService(req.user.id, requestedStatus);

  return res.status(200).json({
    success: true,
    incidents,
  });
});

export const getIncidentById = asyncHandler<IncidentParams>(
  async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const incident = await getIncidentByIdService(
      req.params.incidentId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      incident,
    });
  },
);

export const resolveIncident = asyncHandler<IncidentParams>(
  async (req, res) => {
    if (!req.user) {
      throw new ApiError("Authentication required.", 401);
    }

    const incident = await manuallyResolveIncidentService(
      req.params.incidentId,
      req.user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Incident resolved successfully.",
      incident,
    });
  },
);

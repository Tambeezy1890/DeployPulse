import { Router } from "express";

import protect from "../../auth/middleware/protect.js";

import {
  getIncidentById,
  getIncidents,
  resolveIncident,
} from "../controller/incident.controller.js";

const incidentRouter = Router();

incidentRouter.use(protect);

incidentRouter.get("/", getIncidents);

incidentRouter.get("/:incidentId", getIncidentById);

incidentRouter.patch("/:incidentId/resolve", resolveIncident);

export default incidentRouter;

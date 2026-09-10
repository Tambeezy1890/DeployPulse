import api from "./api";

import type { Incident, IncidentStatus } from "../types/incident";

type IncidentsResponse = {
  success: boolean;
  incidents: Incident[];
};

type IncidentResponse = {
  success: boolean;
  message?: string;
  incident: Incident;
};

const getIncidents = async (status?: IncidentStatus): Promise<Incident[]> => {
  const response = await api.get<IncidentsResponse>("/incidents", {
    params: status ? { status } : undefined,
  });

  return response.data.incidents;
};

const getIncidentById = async (incidentId: string): Promise<Incident> => {
  const response = await api.get<IncidentResponse>(`/incidents/${incidentId}`);

  return response.data.incident;
};

const resolveIncident = async (incidentId: string): Promise<Incident> => {
  const response = await api.patch<IncidentResponse>(
    `/incidents/${incidentId}/resolve`,
  );

  return response.data.incident;
};

const incidentService = {
  getIncidents,
  getIncidentById,
  resolveIncident,
};

export default incidentService;

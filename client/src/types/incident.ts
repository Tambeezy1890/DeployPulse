export type IncidentStatus = "OPEN" | "RESOLVED";

export type IncidentSeverity = "WARNING" | "CRITICAL";

export type IncidentCause = "DEPLOYMENT" | "HEALTH" | "COMBINED";

export type IncidentEventType =
  | "DEPLOYMENT_FAILED"
  | "HEALTH_DEGRADED"
  | "HEALTH_DOWN"
  | "HEALTH_RECOVERING"
  | "HEALTHY"
  | "INCIDENT_OPENED"
  | "INCIDENT_ESCALATED"
  | "INCIDENT_RESOLVED";

export type IncidentEvent = {
  id: string;
  type: IncidentEventType;
  message: string;
  sourceId: string | null;
  dedupeKey: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  incidentId: string;
};

export type IncidentProject = {
  id: string;
  name: string;
  slug: string;
};

export type Incident = {
  id: string;
  title: string;
  summary: string | null;
  status: IncidentStatus;
  severity: IncidentSeverity;
  cause: IncidentCause;
  openedAt: string;
  lastActivityAt: string;
  resolvedAt: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  project: IncidentProject;
  events: IncidentEvent[];
};

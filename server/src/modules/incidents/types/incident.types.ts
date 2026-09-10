export type IncidentSignalCause = "DEPLOYMENT" | "HEALTH";

export type IncidentSignalSeverity = "WARNING" | "CRITICAL";

export type IncidentSignalEvent =
  | "DEPLOYMENT_FAILED"
  | "HEALTH_DEGRADED"
  | "HEALTH_DOWN";

export type IncidentMetadata = Record<string, string | number | boolean | null>;

export type OpenIncidentSignal = {
  projectId: string;
  cause: IncidentSignalCause;
  severity: IncidentSignalSeverity;
  eventType: IncidentSignalEvent;
  message: string;
  sourceId: string;
  dedupeKey: string;
  metadata?: IncidentMetadata;
};

export type IncidentParams = {
  incidentId: string;
};

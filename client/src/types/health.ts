export type HealthStatus = "UP" | "DOWN";
export type MonitorStatus =
  | "PENDING"
  | "HEALTHY"
  | "DEGRADED"
  | "DOWN"
  | "RECOVERING";

export interface HealthCheck {
  id: string;
  projectId: string;
  checkedUrl: string;
  status: HealthStatus;
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
  checkedAt: string;
}

export interface ProjectHealth {
  latestCheck: HealthCheck | null;
  checks: HealthCheck[];
  monitor: {
    status: MonitorStatus;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    statusChangedAt: string | null;
    lastCheckedAt: string | null;
  };
  metrics: {
    uptimePercentage: number | null;
    averageResponseTimeMs: number | null;
    totalChecks: number;
  };
}

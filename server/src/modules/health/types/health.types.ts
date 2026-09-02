export type HealthCheckResult = {
  status: "UP" | "DOWN";
  statusCode: number | null;
  responseTimeMs: number | null;
  errorMessage: string | null;
};

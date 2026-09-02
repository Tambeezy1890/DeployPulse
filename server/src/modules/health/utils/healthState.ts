export type MonitorStatus =
  | "PENDING"
  | "HEALTHY"
  | "DEGRADED"
  | "DOWN"
  | "RECOVERING";

type HealthCheckStatus = "UP" | "DOWN";

type CurrentMonitorState = {
  monitorStatus: MonitorStatus;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
};

export type NextMonitorState = CurrentMonitorState & {
  statusChanged: boolean;
};

const FAILURES_BEFORE_DOWN = 3;
const SUCCESSES_BEFORE_HEALTHY = 2;

export function calculateNextMonitorState(
  current: CurrentMonitorState,
  checkStatus: HealthCheckStatus,
): NextMonitorState {
  let monitorStatus = current.monitorStatus;
  let consecutiveFailures = current.consecutiveFailures;
  let consecutiveSuccesses = current.consecutiveSuccesses;

  if (checkStatus === "DOWN") {
    consecutiveFailures += 1;
    consecutiveSuccesses = 0;

    if (
      current.monitorStatus === "PENDING" ||
      current.monitorStatus === "HEALTHY"
    ) {
      monitorStatus = "DEGRADED";
    }

    if (
      current.monitorStatus === "RECOVERING" ||
      consecutiveFailures >= FAILURES_BEFORE_DOWN
    ) {
      monitorStatus = "DOWN";
    }
  }

  if (checkStatus === "UP") {
    consecutiveSuccesses += 1;
    consecutiveFailures = 0;

    if (
      current.monitorStatus === "PENDING" ||
      current.monitorStatus === "HEALTHY" ||
      current.monitorStatus === "DEGRADED"
    ) {
      monitorStatus = "HEALTHY";
    }

    if (current.monitorStatus === "DOWN") {
      monitorStatus = "RECOVERING";
    }

    if (
      current.monitorStatus === "RECOVERING" &&
      consecutiveSuccesses >= SUCCESSES_BEFORE_HEALTHY
    ) {
      monitorStatus = "HEALTHY";
    }
  }

  return {
    monitorStatus,
    consecutiveFailures,
    consecutiveSuccesses,
    statusChanged: monitorStatus !== current.monitorStatus,
  };
}

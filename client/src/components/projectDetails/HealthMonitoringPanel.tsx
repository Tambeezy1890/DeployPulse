import { ExternalLink, RefreshCw, Wifi, WifiOff } from "lucide-react";

import HealthMetric from "./HealthMetric";

import type { ProjectHealth } from "../../types/health";

type HealthMonitoringPanelProps = {
  monitoringEnabled: boolean;
  healthCheckUrl?: string | null;
  health: ProjectHealth | null;
  loading: boolean;
  onRefresh: () => void;
};

const monitorStatusLabels: Record<ProjectHealth["monitor"]["status"], string> =
  {
    PENDING: "Pending",
    HEALTHY: "Healthy",
    DEGRADED: "Degraded",
    DOWN: "Down",
    RECOVERING: "Recovering",
  };

const monitorStatusColors: Record<ProjectHealth["monitor"]["status"], string> =
  {
    PENDING: "text-slate-400",
    HEALTHY: "text-emerald-400",
    DEGRADED: "text-amber-400",
    DOWN: "text-red-400",
    RECOVERING: "text-blue-400",
  };

function HealthMonitoringPanel({
  monitoringEnabled,
  healthCheckUrl,
  health,
  loading,
  onRefresh,
}: HealthMonitoringPanelProps) {
  const latestCheck = health?.latestCheck;

  return (
    <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {latestCheck?.status === "UP" ? (
              <Wifi size={18} className="text-emerald-400" />
            ) : (
              <WifiOff size={18} className="text-slate-500" />
            )}

            <p className="text-sm font-medium text-indigo-400">
              Uptime monitoring
            </p>
          </div>

          <h2 className="mt-2 text-xl font-semibold">Application health</h2>

          <p className="mt-1 text-sm text-slate-400">
            Real availability checks recorded by the DeployPulse worker.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {healthCheckUrl && (
            <a
              href={healthCheckUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              Open endpoint
              <ExternalLink size={14} />
            </a>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            aria-label="Refresh health checks"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {!monitoringEnabled ? (
        <MonitoringDisabled />
      ) : !latestCheck || !health ? (
        <WaitingForHealthData loading={loading} />
      ) : (
        <HealthDetails health={health} />
      )}
    </section>
  );
}

function MonitoringDisabled() {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
      <WifiOff size={26} className="mx-auto text-slate-600" />

      <h3 className="mt-3 font-medium">Monitoring is disabled</h3>

      <p className="mt-1 text-sm text-slate-500">
        Edit the project and enable uptime monitoring.
      </p>
    </div>
  );
}

type WaitingForHealthDataProps = {
  loading: boolean;
};

function WaitingForHealthData({ loading }: WaitingForHealthDataProps) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
      <RefreshCw
        size={25}
        className={
          loading
            ? "mx-auto animate-spin text-indigo-400"
            : "mx-auto text-slate-600"
        }
      />

      <h3 className="mt-3 font-medium">Waiting for health data</h3>

      <p className="mt-1 text-sm text-slate-500">
        The worker has not recorded a health check yet.
      </p>
    </div>
  );
}

type HealthDetailsProps = {
  health: ProjectHealth;
};

function HealthDetails({ health }: HealthDetailsProps) {
  const { latestCheck, metrics, monitor, checks } = health;

  if (!latestCheck) return null;

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HealthMetric
          label="Current status"
          value={monitorStatusLabels[monitor.status]}
          valueClassName={monitorStatusColors[monitor.status]}
        />

        <HealthMetric
          label="Uptime"
          value={
            metrics.uptimePercentage === null
              ? "—"
              : `${metrics.uptimePercentage}%`
          }
        />

        <HealthMetric
          label="Response time"
          value={
            latestCheck.responseTimeMs === null
              ? "—"
              : `${latestCheck.responseTimeMs} ms`
          }
        />

        <HealthMetric
          label="Average response"
          value={
            metrics.averageResponseTimeMs === null
              ? "—"
              : `${metrics.averageResponseTimeMs} ms`
          }
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-slate-500">Last checked: </span>

          <span className="text-slate-300">
            {new Date(latestCheck.checkedAt).toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-slate-500">HTTP status: </span>

          <span className="font-mono text-slate-300">
            {latestCheck.statusCode ?? "No response"}
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-200">
              Recent uptime
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Last {checks.length} availability checks
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Up
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Down
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-1">
          {[...checks].reverse().map((check) => (
            <div
              key={check.id}
              title={`${check.status} • ${new Date(
                check.checkedAt,
              ).toLocaleString()} • ${
                check.responseTimeMs === null
                  ? "No response"
                  : `${check.responseTimeMs} ms`
              }`}
              className={`h-9 min-w-1 flex-1 rounded-sm transition hover:scale-y-110 ${
                check.status === "UP" ? "bg-emerald-400" : "bg-red-400"
              }`}
            />
          ))}
        </div>

        <div className="mt-2 flex justify-between text-xs text-slate-600">
          <span>Oldest</span>
          <span>Latest</span>
        </div>
      </div>

      {latestCheck.errorMessage && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
          {latestCheck.errorMessage}
        </div>
      )}
    </>
  );
}

export default HealthMonitoringPanel;

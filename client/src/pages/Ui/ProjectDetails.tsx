import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { Link, useParams } from "react-router-dom";

import {
  Activity,
  CheckCircle2,
  ChevronDown,
  Clock3,
  ExternalLink,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";

import { useProject } from "../../contexts/ProjectContext";
import { useDeployment } from "../../contexts/DeploymentContext";

import DeploymentPipeline from "../../components/ui/DeploymentPipeline";

import healthService from "../../services/healthServices";

import type { Deployment, Environment } from "../../types/deployment";

import type { ProjectHealth } from "../../types/health";

type EnvironmentFilter = "ALL" | Environment;

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

type SortOption = "NEWEST" | "OLDEST";

const statusStyles: Record<string, string> = {
  SUCCESS: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",

  FAILED: "border-red-500/20 bg-red-500/10 text-red-400",

  RUNNING: "border-blue-500/20 bg-blue-500/10 text-blue-400",

  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-400",

  CANCELLED: "border-slate-600 bg-slate-800 text-slate-400",
};

const environmentStyles: Record<string, string> = {
  DEVELOPMENT: "text-blue-400",
  STAGING: "text-amber-400",
  PRODUCTION: "text-purple-400",
};
const monitorStatusLabels = {
  PENDING: "Pending",
  HEALTHY: "Healthy",
  DEGRADED: "Degraded",
  DOWN: "Down",
  RECOVERING: "Recovering",
};

const monitorStatusColors = {
  PENDING: "text-slate-400",
  HEALTHY: "text-emerald-400",
  DEGRADED: "text-amber-400",
  DOWN: "text-red-400",
  RECOVERING: "text-blue-400",
};

function ProjectDetails() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const {
    selectedProject: project,
    loading: projectLoading,
    getProjectById,
  } = useProject();

  const {
    deployments,
    loading: deploymentLoading,
    getDeployments,
    createDeployment,
    deleteDeployment,
  } = useDeployment();

  // Deployment form
  const [environment, setEnvironment] = useState<Environment>("DEVELOPMENT");

  const [branch, setBranch] = useState("main");

  const [deploying, setDeploying] = useState(false);

  // Health monitoring
  const [health, setHealth] = useState<ProjectHealth | null>(null);

  const [healthLoading, setHealthLoading] = useState(false);

  // Deployment-history filters
  const [search, setSearch] = useState("");

  const [environmentFilter, setEnvironmentFilter] =
    useState<EnvironmentFilter>("ALL");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [sort, setSort] = useState<SortOption>("NEWEST");

  const loadHealth = useCallback(async () => {
    if (!projectId) return;

    try {
      setHealthLoading(true);

      const healthData = await healthService.getProjectHealth(projectId);

      setHealth(healthData);
    } catch (error) {
      console.error("Failed to load project health:", error);
    } finally {
      setHealthLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    void getProjectById(projectId);
    void getDeployments(projectId);
  }, [projectId, getProjectById, getDeployments]);

  // Load health data and continue polling while monitoring is enabled.
  useEffect(() => {
    if (!projectId) return;

    void loadHealth();

    if (!project?.monitoringEnabled) return;

    const interval = setInterval(() => {
      void loadHealth();
    }, 15_000);

    return () => clearInterval(interval);
  }, [projectId, project?.monitoringEnabled, loadHealth]);

  // Poll deployments while one is active.
  useEffect(() => {
    if (!projectId) return;

    const hasActiveDeployment = deployments.some(
      (deployment) =>
        deployment.status === "PENDING" || deployment.status === "RUNNING",
    );

    if (!hasActiveDeployment) return;

    const interval = setInterval(() => {
      void getDeployments(projectId);
    }, 1500);

    return () => clearInterval(interval);
  }, [deployments, projectId, getDeployments]);

  const latestDeployment = deployments[0];

  const successfulDeployments = deployments.filter(
    (deployment) => deployment.status === "SUCCESS",
  ).length;

  const failedDeployments = deployments.filter(
    (deployment) => deployment.status === "FAILED",
  ).length;

  const activeDeployments = deployments.filter(
    (deployment) =>
      deployment.status === "RUNNING" || deployment.status === "PENDING",
  ).length;

  const finishedDeployments = successfulDeployments + failedDeployments;

  const successRate =
    finishedDeployments === 0
      ? 0
      : Math.round((successfulDeployments / finishedDeployments) * 100);

  const filteredDeployments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...deployments]
      .filter((deployment) => {
        const matchesSearch =
          !searchValue ||
          deployment.branch?.toLowerCase().includes(searchValue) ||
          deployment.commitMessage?.toLowerCase().includes(searchValue) ||
          deployment.commitSha?.toLowerCase().includes(searchValue);

        const matchesEnvironment =
          environmentFilter === "ALL" ||
          deployment.environment === environmentFilter;

        const matchesStatus =
          statusFilter === "ALL" || deployment.status === statusFilter;

        return matchesSearch && matchesEnvironment && matchesStatus;
      })
      .sort((first, second) => {
        const firstTime = new Date(first.createdAt).getTime();

        const secondTime = new Date(second.createdAt).getTime();

        return sort === "NEWEST"
          ? secondTime - firstTime
          : firstTime - secondTime;
      });
  }, [deployments, search, environmentFilter, statusFilter, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    environmentFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    sort !== "NEWEST";

  const clearFilters = () => {
    setSearch("");
    setEnvironmentFilter("ALL");
    setStatusFilter("ALL");
    setSort("NEWEST");
  };

  const handleDeploy = async () => {
    if (!projectId || !branch.trim()) return;

    try {
      setDeploying(true);

      await createDeployment(projectId, {
        environment,
        branch: branch.trim(),
        commitMessage: "Simulated DeployPulse deployment",
      });
    } finally {
      setDeploying(false);
    }
  };

  const handleRefresh = async () => {
    if (!projectId) return;

    await Promise.all([getDeployments(projectId), loadHealth()]);
  };

  const handleDelete = async (deploymentId: string) => {
    if (!projectId) return;

    const confirmed = window.confirm("Delete this deployment record?");

    if (!confirmed) return;

    await deleteDeployment(projectId, deploymentId);
  };

  if (projectLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw size={18} className="animate-spin" />
          Loading project...
        </div>
      </main>
    );
  }

  if (!projectId || !project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <p className="text-lg font-medium">Project not found.</p>

        <Link
          to="/dashboard"
          className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/dashboard"
          className="inline-flex text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to dashboard
        </Link>

        {/* Project header */}
        <header className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50">
          <div className="flex flex-col gap-8 p-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400" />

                <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
                  Project
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>

              <p className="mt-2 max-w-xl text-slate-400">
                {project.description ?? "No description provided"}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>/{project.slug}</span>

                {project.provider && (
                  <>
                    <span>•</span>
                    <span>{project.provider}</span>
                  </>
                )}

                <span>•</span>

                <span>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* New deployment form */}
            <div className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                New deployment
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <select
                  value={environment}
                  onChange={(event) =>
                    setEnvironment(event.target.value as Environment)
                  }
                  className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none transition focus:border-indigo-500"
                >
                  <option value="DEVELOPMENT">Development</option>

                  <option value="STAGING">Staging</option>

                  <option value="PRODUCTION">Production</option>
                </select>

                <input
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  placeholder="Branch name"
                  className="min-w-48 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={deploying || !branch.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deploying ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Play size={18} />
                  )}

                  {deploying ? "Starting..." : "Deploy"}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Deployment metrics */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total deployments"
            value={deployments.length}
            icon={<Activity size={18} />}
            color="indigo"
          />

          <MetricCard
            label="Successful"
            value={successfulDeployments}
            icon={<CheckCircle2 size={18} />}
            color="emerald"
          />

          <MetricCard
            label="Failed"
            value={failedDeployments}
            icon={<XCircle size={18} />}
            color="red"
          />

          <MetricCard
            label="Success rate"
            value={`${successRate}%`}
            subtitle={
              activeDeployments > 0
                ? `${activeDeployments} currently active`
                : "No active deployments"
            }
            icon={<Activity size={18} />}
            color="blue"
          />
        </section>

        {/* Health monitoring */}
        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                {health?.latestCheck?.status === "UP" ? (
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
              {project.healthCheckUrl && (
                <a
                  href={project.healthCheckUrl}
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
                onClick={() => void loadHealth()}
                disabled={healthLoading}
                className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                aria-label="Refresh health checks"
              >
                <RefreshCw
                  size={16}
                  className={healthLoading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {!project.monitoringEnabled ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
              <WifiOff size={26} className="mx-auto text-slate-600" />

              <h3 className="mt-3 font-medium">Monitoring is disabled</h3>

              <p className="mt-1 text-sm text-slate-500">
                Edit the project and enable uptime monitoring.
              </p>
            </div>
          ) : !health?.latestCheck ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-8 text-center">
              <RefreshCw
                size={25}
                className={
                  healthLoading
                    ? "mx-auto animate-spin text-indigo-400"
                    : "mx-auto text-slate-600"
                }
              />

              <h3 className="mt-3 font-medium">Waiting for health data</h3>

              <p className="mt-1 text-sm text-slate-500">
                The worker has not recorded a health check yet.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <HealthMetric
                  label="Current status"
                  value={monitorStatusLabels[health.monitor.status]}
                  valueClassName={monitorStatusColors[health.monitor.status]}
                />

                <HealthMetric
                  label="Uptime"
                  value={
                    health.metrics.uptimePercentage === null
                      ? "—"
                      : `${health.metrics.uptimePercentage}%`
                  }
                />

                <HealthMetric
                  label="Response time"
                  value={
                    health.latestCheck.responseTimeMs === null
                      ? "—"
                      : `${health.latestCheck.responseTimeMs} ms`
                  }
                />

                <HealthMetric
                  label="Average response"
                  value={
                    health.metrics.averageResponseTimeMs === null
                      ? "—"
                      : `${health.metrics.averageResponseTimeMs} ms`
                  }
                />
              </div>

              <div className="mt-4 flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-950 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-slate-500">Last checked: </span>

                  <span className="text-slate-300">
                    {new Date(health.latestCheck.checkedAt).toLocaleString()}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500">HTTP status: </span>

                  <span className="font-mono text-slate-300">
                    {health.latestCheck.statusCode ?? "No response"}
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
                      Last {health.checks.length} availability checks
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
                  {[...health.checks].reverse().map((check) => (
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

              {health.latestCheck.errorMessage && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
                  {health.latestCheck.errorMessage}
                </div>
              )}
            </>
          )}
        </section>

        {/* Current deployment */}
        {latestDeployment ? (
          <div className="mt-6">
            <DeploymentPipeline deployment={latestDeployment} />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
            <Play size={28} className="mx-auto text-slate-600" />

            <h2 className="mt-3 font-semibold">No deployment activity</h2>

            <p className="mt-1 text-sm text-slate-500">
              Run your first deployment to see the pipeline.
            </p>
          </div>
        )}

        {/* Deployment history */}
        <section className="mt-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Deployment history</h2>

              <p className="mt-1 text-sm text-slate-400">
                Showing {filteredDeployments.length} of {deployments.length}{" "}
                deployments
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={deploymentLoading || healthLoading}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={
                  deploymentLoading || healthLoading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_160px_160px_auto]">
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search branch, commit or message..."
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
                />
              </div>

              <FilterSelect
                value={environmentFilter}
                onChange={(value) =>
                  setEnvironmentFilter(value as EnvironmentFilter)
                }
                ariaLabel="Filter by environment"
              >
                <option value="ALL">All environments</option>

                <option value="DEVELOPMENT">Development</option>

                <option value="STAGING">Staging</option>

                <option value="PRODUCTION">Production</option>
              </FilterSelect>

              <FilterSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value as StatusFilter)}
                ariaLabel="Filter by status"
              >
                <option value="ALL">All statuses</option>

                <option value="SUCCESS">Success</option>

                <option value="FAILED">Failed</option>

                <option value="RUNNING">Running</option>

                <option value="PENDING">Pending</option>

                <option value="CANCELLED">Cancelled</option>
              </FilterSelect>

              <FilterSelect
                value={sort}
                onChange={(value) => setSort(value as SortOption)}
                ariaLabel="Sort deployments"
              >
                <option value="NEWEST">Newest first</option>

                <option value="OLDEST">Oldest first</option>
              </FilterSelect>

              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <RotateCcw size={15} />
                Clear
              </button>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {deployments.length === 0 ? (
              <EmptyHistory
                title="No deployments yet"
                message="Choose an environment and deploy a branch to get started."
              />
            ) : filteredDeployments.length === 0 ? (
              <EmptyHistory
                title="No matching deployments"
                message="Change or clear your filters to see more results."
                action={clearFilters}
              />
            ) : (
              filteredDeployments.map((deployment) => (
                <DeploymentRow
                  key={deployment.id}
                  deployment={deployment}
                  onDelete={() => void handleDelete(deployment.id)}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

type MetricCardProps = {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color: "indigo" | "emerald" | "red" | "blue";
};

const metricColors = {
  indigo: "bg-indigo-500/10 text-indigo-400",

  emerald: "bg-emerald-500/10 text-emerald-400",

  red: "bg-red-500/10 text-red-400",

  blue: "bg-blue-500/10 text-blue-400",
};

function MetricCard({ label, value, subtitle, icon, color }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-400">{label}</p>

          <p className="mt-2 text-2xl font-semibold">{value}</p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        <span className={`rounded-xl p-2.5 ${metricColors[color]}`}>
          {icon}
        </span>
      </div>
    </article>
  );
}

type HealthMetricProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function HealthMetric({
  label,
  value,
  valueClassName = "text-white",
}: HealthMetricProps) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-xl font-semibold ${valueClassName}`}>{value}</p>
    </article>
  );
}

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: ReactNode;
};

function FilterSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-9 text-sm outline-none transition focus:border-indigo-500"
      >
        {children}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}

type DeploymentRowProps = {
  deployment: Deployment;
  onDelete: () => void;
};

function DeploymentRow({ deployment, onDelete }: DeploymentRowProps) {
  return (
    <article className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-900/80">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="truncate font-semibold">
              {deployment.branch ?? "Unknown branch"}
            </h3>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                statusStyles[deployment.status] ?? statusStyles.PENDING
              }`}
            >
              {deployment.status}
            </span>

            <span
              className={`text-xs font-semibold ${
                environmentStyles[deployment.environment] ?? "text-slate-400"
              }`}
            >
              {deployment.environment}
            </span>
          </div>

          <p className="mt-2 truncate text-sm text-slate-400">
            {deployment.commitMessage ?? "Simulated DeployPulse deployment"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />

              {new Date(deployment.createdAt).toLocaleString()}
            </span>

            {deployment.durationMs !== null && (
              <span>Duration {(deployment.durationMs / 1000).toFixed(2)}s</span>
            )}

            {deployment.commitSha && (
              <span className="font-mono">
                {deployment.commitSha.slice(0, 7)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onDelete}
          className="self-start rounded-lg p-2 text-slate-600 opacity-100 transition hover:bg-red-500/10 hover:text-red-400 md:self-auto md:opacity-0 md:group-hover:opacity-100"
          aria-label="Delete deployment"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

type EmptyHistoryProps = {
  title: string;
  message: string;
  action?: () => void;
};

function EmptyHistory({ title, message, action }: EmptyHistoryProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
      <Search size={25} className="mx-auto text-slate-600" />

      <h3 className="mt-3 font-medium">{title}</h3>

      <p className="mt-1 text-sm text-slate-500">{message}</p>

      {action && (
        <button
          type="button"
          onClick={action}
          className="mt-4 text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default ProjectDetails;

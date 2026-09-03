import {
  Clock3,
  ExternalLink,
  FileText,
  GitBranch,
  LoaderCircle,
} from "lucide-react";

import { FaGithub } from "react-icons/fa";

import type { Deployment } from "../../types/deployment";

type DeploymentPipelineProps = {
  deployment: Deployment;
};

const statusStyles = {
  PENDING: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  RUNNING: "border-blue-500/20 bg-blue-500/10 text-blue-400",
  SUCCESS: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  FAILED: "border-red-500/20 bg-red-500/10 text-red-400",
  CANCELLED: "border-slate-600 bg-slate-800 text-slate-400",
};

const statusMessages = {
  PENDING: "Waiting for the deployment provider",
  RUNNING: "Deployment is currently in progress",
  SUCCESS: "Deployment completed successfully",
  FAILED: "Deployment completed with an error",
  CANCELLED: "Deployment was cancelled",
};

function DeploymentPipeline({ deployment }: DeploymentPipelineProps) {
  const eventDate =
    deployment.finishedAt ?? deployment.startedAt ?? deployment.createdAt;

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-400">
            {deployment.source === "GITHUB" ? (
              <FaGithub size={16} />
            ) : (
              <LoaderCircle size={16} />
            )}
            Latest deployment
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {deployment.branch ?? "Unknown branch"}
            </h2>

            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                statusStyles[deployment.status]
              }`}
            >
              {deployment.status}
            </span>

            <span className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-400">
              {deployment.environment}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-400">
            {deployment.commitMessage ?? statusMessages[deployment.status]}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {deployment.deploymentUrl && (
            <a
              href={deployment.deploymentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Open deployment
              <ExternalLink size={15} />
            </a>
          )}

          {deployment.logsUrl && (
            <a
              href={deployment.logsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              View logs
              <FileText size={15} />
            </a>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DeploymentDetail label="Source" value={deployment.source} />

        <DeploymentDetail
          label="Commit"
          value={
            deployment.commitSha
              ? deployment.commitSha.slice(0, 7)
              : "Unavailable"
          }
          monospace
        />

        <DeploymentDetail
          label="Started"
          value={
            deployment.startedAt
              ? new Date(deployment.startedAt).toLocaleString()
              : "Unavailable"
          }
        />

        <DeploymentDetail
          label="Duration"
          value={
            deployment.durationMs !== null
              ? formatDuration(deployment.durationMs)
              : "Unavailable"
          }
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <GitBranch size={16} />

          <span>{statusMessages[deployment.status]}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock3 size={14} />

          {new Date(eventDate).toLocaleString()}
        </div>
      </div>
    </section>
  );
}

type DeploymentDetailProps = {
  label: string;
  value: string;
  monospace?: boolean;
};

function DeploymentDetail({
  label,
  value,
  monospace = false,
}: DeploymentDetailProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 truncate text-sm text-slate-200 ${
          monospace ? "font-mono" : ""
        }`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function formatDuration(durationMs: number) {
  const totalSeconds = durationMs / 1000;

  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(2)}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);

  return `${minutes}m ${seconds}s`;
}

export default DeploymentPipeline;

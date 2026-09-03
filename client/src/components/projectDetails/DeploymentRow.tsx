import { Clock3, ExternalLink, FileText, Trash2 } from "lucide-react";

import type { Deployment } from "../../types/deployment";

type DeploymentRowProps = {
  deployment: Deployment;
  onDelete: () => void;
};

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
            {deployment.commitMessage ?? "No deployment description"}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />

              {new Date(deployment.createdAt).toLocaleString()}
            </span>

            {deployment.durationMs !== null &&
              deployment.durationMs !== undefined && (
                <span>
                  Duration {(deployment.durationMs / 1000).toFixed(2)}s
                </span>
              )}

            {deployment.commitSha && (
              <span className="font-mono">
                {deployment.commitSha.slice(0, 7)}
              </span>
            )}

            {"source" in deployment && deployment.source && (
              <span>{deployment.source}</span>
            )}
          </div>

          {(deployment.deploymentUrl || deployment.logsUrl) && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {deployment.deploymentUrl && (
                <a
                  href={deployment.deploymentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  View deployment
                  <ExternalLink size={13} />
                </a>
              )}

              {deployment.logsUrl && (
                <a
                  href={deployment.logsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white"
                >
                  View logs
                  <FileText size={13} />
                </a>
              )}
            </div>
          )}
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

export default DeploymentRow;

import { useEffect } from "react";

import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";

import type { Deployment } from "../../types/deployment";

type DeleteDeploymentModalProps = {
  deployment: Deployment | null;
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteDeploymentModal({
  deployment,
  deleting,
  onClose,
  onConfirm,
}: DeleteDeploymentModalProps) {
  useEffect(() => {
    if (!deployment) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deleting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [deployment, deleting, onClose]);

  if (!deployment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-deployment-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle size={22} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={19} />
          </button>
        </div>

        <h2
          id="delete-deployment-title"
          className="mt-5 text-xl font-semibold text-white"
        >
          Delete deployment record?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          This removes the deployment from DeployPulse. It will not delete the
          deployment from GitHub or your hosting provider.
        </p>

        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                {deployment.branch ?? "Unknown branch"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {deployment.source} · {deployment.environment}
              </p>
            </div>

            <span className="rounded-full border border-slate-700 px-2.5 py-1 text-xs font-semibold text-slate-400">
              {deployment.status}
            </span>
          </div>

          {deployment.commitSha && (
            <p className="mt-3 font-mono text-xs text-slate-500">
              Commit {deployment.commitSha.slice(0, 7)}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Trash2 size={17} />
            )}

            {deleting ? "Deleting..." : "Delete record"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteDeploymentModal;

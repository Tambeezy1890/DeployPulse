import { useEffect } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  ExternalLink,
  GitCommitHorizontal,
  HeartPulse,
  Server,
  X,
} from "lucide-react";

import type { Incident, IncidentEvent } from "../../types/incident";

type IncidentDetailsModalProps = {
  incident: Incident;
  resolving: boolean;
  onClose: () => void;
  onResolve: () => void;
  onOpenProject: () => void;
};

function getSeverityClasses(severity: Incident["severity"]) {
  switch (severity) {
    case "CRITICAL":
      return "border-red-500/30 bg-red-500/10 text-red-300";

    case "WARNING":
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";

    default:
      return "border-sky-500/30 bg-sky-500/10 text-sky-300";
  }
}
function getEventIcon(event: IncidentEvent) {
  if (event.type === "DEPLOYMENT_FAILED") {
    return <GitCommitHorizontal size={17} />;
  }

  if (event.type.includes("HEALTH")) {
    return <HeartPulse size={17} />;
  }

  if (event.type === "INCIDENT_RESOLVED") {
    return <CheckCircle2 size={17} />;
  }

  if (event.type === "INCIDENT_OPENED") {
    return <AlertTriangle size={17} />;
  }

  return <Clock3 size={17} />;
}

function formatEventType(type: string) {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function IncidentDetailsModal({
  incident,
  resolving,
  onClose,
  onResolve,
  onOpenProject,
}: IncidentDetailsModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const isResolved = incident.status === "RESOLVED";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="incident-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-800 p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getSeverityClasses(
                  incident.severity,
                )}`}
              >
                {incident.severity.toLowerCase()}
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                {incident.status.toLowerCase()}
              </span>
            </div>

            <h2
              id="incident-title"
              className="mt-3 text-xl font-semibold text-white"
            >
              {incident.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              {incident.summary}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close incident details"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </header>

        <div className="max-h-[calc(90vh-170px)] overflow-y-auto p-6">
          <section className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-500">Project</p>

              <p className="mt-1 font-medium text-white">
                {incident.project.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Cause</p>

              <p className="mt-1 font-medium capitalize text-white">
                {incident.cause.toLowerCase()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Opened</p>

              <p className="mt-1 text-slate-300">
                {new Date(incident.openedAt).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Last activity</p>

              <p className="mt-1 text-slate-300">
                {new Date(incident.lastActivityAt).toLocaleString()}
              </p>
            </div>

            {incident.resolvedAt && (
              <div className="sm:col-span-2">
                <p className="text-xs text-slate-500">Resolved</p>

                <p className="mt-1 text-emerald-300">
                  {new Date(incident.resolvedAt).toLocaleString()}
                </p>
              </div>
            )}
          </section>

          <section className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Incident timeline</h3>

                <p className="mt-1 text-sm text-slate-400">
                  Events automatically correlated by DeployPulse.
                </p>
              </div>

              <span className="text-xs text-slate-500">
                {incident.events.length}{" "}
                {incident.events.length === 1 ? "event" : "events"}
              </span>
            </div>

            {incident.events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
                No timeline events found.
              </div>
            ) : (
              <div className="space-y-3">
                {incident.events.map((event) => (
                  <article
                    key={event.id}
                    className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300">
                      {getEventIcon(event)}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {formatEventType(event.type)}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {event.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-600">
                        {new Date(event.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="flex flex-col-reverse gap-3 border-t border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onOpenProject}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
          >
            <Server size={17} />
            Open project
            <ExternalLink size={15} />
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Close
            </button>

            {!isResolved && (
              <button
                type="button"
                onClick={onResolve}
                disabled={resolving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={17} />
                {resolving ? "Resolving..." : "Resolve incident"}
              </button>
            )}
          </div>
        </footer>
      </section>
    </div>
  );
}

export default IncidentDetailsModal;

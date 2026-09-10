import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Siren,
} from "lucide-react";

import type { Incident } from "../../types/incident";

type IncidentPanelProps = {
  incidents: Incident[];
  loading: boolean;
  onSelectIncident: (incident: Incident) => void;
  onOpenProject: (projectId: string) => void;
};

function getSeverityClasses(severity: Incident["severity"]) {
  switch (severity) {
    case "CRITICAL":
      return {
        border: "border-red-500/30",
        background: "bg-red-500/10",
        text: "text-red-300",
        icon: "text-red-400",
      };

    case "WARNING":
      return {
        border: "border-amber-500/30",
        background: "bg-amber-500/10",
        text: "text-amber-300",
        icon: "text-amber-400",
      };

    default:
      return {
        border: "border-sky-500/30",
        background: "bg-sky-500/10",
        text: "text-sky-300",
        icon: "text-sky-400",
      };
  }
}

function IncidentPanel({
  incidents,
  loading,
  onSelectIncident,
  onOpenProject,
}: IncidentPanelProps) {
  if (loading && incidents.length === 0) {
    return (
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        <div className="p-6 text-center">
          <p className="text-sm text-slate-400">Loading incidents...</p>
        </div>
      </section>
    );
  }

  if (incidents.length === 0) {
    return (
      <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 size={21} />
          </div>

          <div>
            <h2 className="font-semibold text-emerald-300">
              No active incidents
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              DeployPulse has not detected any unresolved operational issues.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-red-500/20 bg-slate-900/80">
      <header className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <Siren size={22} />
          </div>

          <div>
            <h2 className="font-semibold text-white">Active incidents</h2>

            <p className="text-sm text-slate-400">
              Correlated deployment and health-monitoring problems.
            </p>
          </div>
        </div>

        <span className="w-fit rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
          {incidents.length} {incidents.length === 1 ? "incident" : "incidents"}
        </span>
      </header>

      <div className="divide-y divide-slate-800">
        {incidents.map((incident) => {
          const severityClasses = getSeverityClasses(incident.severity);

          return (
            <article
              key={incident.id}
              className="p-5 transition hover:bg-white/2"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertTriangle size={18} className={severityClasses.icon} />

                    <h3 className="font-semibold text-white">
                      {incident.title}
                    </h3>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${severityClasses.border} ${severityClasses.background} ${severityClasses.text}`}
                    >
                      {incident.severity.toLowerCase()}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-300">
                    {incident.summary}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span>{incident.project.name}</span>

                    <span className="capitalize">
                      Cause: {incident.cause.toLowerCase()}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      Opened {new Date(incident.openedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenProject(incident.projectId)}
                    className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
                  >
                    Open project
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectIncident(incident)}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                  >
                    Investigate
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default IncidentPanel;

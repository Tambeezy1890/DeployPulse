import type { Project } from "../../types/project";
import type { User } from "../../types/user";

import { deployments } from "../../data/deployment";
import StatusBadge from "../ui/StatusBadge";
import { useEffect } from "react";
import DetailRow from "../ui/DetailRow";

type deploymentModalProps = {
  project: Project | null;
  user: User | null;
  onClose: () => void;
};

function DeploymentModal({ project, user, onClose }: deploymentModalProps) {
  if (!project || !user) return null;
  const projectDeployments = deployments.filter(
    (deployment) => deployment.projectId === project.id
  );
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <section
        className="w-full max-w-xl rounded-2xl border border-indigo-400/20 bg-slate-900 p-6 shadow-2xl shadow-indigo-950/40"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-sm font-medium text-indigo-300">
              Project overview
            </p>

            <h2 className="mt-1 text-2xl font-semibold text-white">
              {project.name}
            </h2>
          </div>

          <StatusBadge status={project.status} />
        </header>

        <section className="mt-5 grid gap-3 rounded-xl border border-white/10 bg-slate-950/50 p-4 text-sm">
          <DetailRow label="Opened by" value={user.name} />
          <DetailRow label="Environment" value={project.environment} />
          <DetailRow label="Last deploy" value={project.lastDeploy} />
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Deployment history
            </h3>

            <span className="text-sm text-slate-400">
              {projectDeployments.length} total
            </span>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
            {projectDeployments.length > 0 ? (
              projectDeployments.map((deployment) => (
                <article
                  key={deployment.id}
                  className="rounded-xl border border-white/10 bg-slate-950/40 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {deployment.version}
                      </p>

                      <p className="mt-1 text-sm capitalize text-slate-400">
                        {deployment.environment}
                      </p>
                    </div>

                    <StatusBadge status={deployment.status} />
                  </div>

                  <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                    <p>
                      Duration:{" "}
                      <span className="text-white">{deployment.duration}</span>
                    </p>

                    <p>
                      Triggered by:{" "}
                      <span className="text-white">
                        {deployment.triggeredBy}
                      </span>
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-400">
                No deployments found.
              </div>
            )}
          </div>
        </section>

        <footer className="mt-6 flex justify-end border-t border-white/10 pt-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

export default DeploymentModal;

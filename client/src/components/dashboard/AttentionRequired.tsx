import { AlertTriangle, ArrowRight } from "lucide-react";

import type { Deployment } from "../../types/deployment";
import type { Project } from "../../types/project";

type ProjectIssue = {
  project: Project;
  deployment: Deployment;
};

type AttentionRequiredProps = {
  projects: Project[];
  deployments: Deployment[];
  onOpenProject: (projectId: string) => void;
};

function AttentionRequired({
  projects,
  deployments,
  onOpenProject,
}: AttentionRequiredProps) {
  const issues: ProjectIssue[] = projects.flatMap((project) => {
    const latestDeployment = deployments
      .filter((deployment) => deployment.projectId === project.id)
      .sort(
        (first, second) =>
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime(),
      )[0];

    if (latestDeployment?.status !== "FAILED") {
      return [];
    }

    return [
      {
        project,
        deployment: latestDeployment,
      },
    ];
  });

  if (issues.length === 0) {
    return (
      <section className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <p className="font-medium text-emerald-300">
          All monitored projects are operating normally
        </p>

        <p className="mt-1 text-sm text-slate-400">
          No failed latest deployments require your attention.
        </p>
      </section>
    );
  }

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-red-500/20 bg-slate-900/80">
      <header className="flex items-center justify-between border-b border-slate-800 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-white">Attention required</h2>

            <p className="text-sm text-slate-400">
              Projects with a failed latest deployment
            </p>
          </div>
        </div>

        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-300">
          {issues.length} {issues.length === 1 ? "issue" : "issues"}
        </span>
      </header>

      <div className="divide-y divide-slate-800">
        {issues.map(({ project, deployment }) => (
          <article
            key={project.id}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-white">{project.name}</p>

              <p className="mt-1 text-sm text-red-300">
                Latest deployment failed
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {deployment.branch ?? "Unknown branch"} ·{" "}
                {deployment.environment.toLowerCase()} ·{" "}
                {new Date(deployment.createdAt).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenProject(project.id)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-300"
            >
              Investigate
              <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export default AttentionRequired;

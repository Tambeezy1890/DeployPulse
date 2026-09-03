import { CheckCircle2, ExternalLink, Unplug } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import type { Project } from "../../types/project";

type ProjectHeaderProps = {
  project: Project;
};

function ProjectHeader({ project }: ProjectHeaderProps) {
  const githubConnected = Boolean(project.githubRepoFullName);

  const repositoryUrl =
    project.repository ||
    (project.githubRepoFullName
      ? `https://github.com/${project.githubRepoFullName}`
      : null);

  return (
    <header className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-900/50">
      <div className="grid gap-8 p-6 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-400" />

            <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400">
              Project
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>

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

        {githubConnected ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-950 p-2.5 text-white">
                  <FaGithub size={21} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">GitHub connected</p>

                    <CheckCircle2 size={16} className="text-emerald-400" />
                  </div>

                  <p className="mt-1 text-sm text-slate-400">
                    Deployment events are being monitored.
                  </p>
                </div>
              </div>

              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                Connected
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Repository
              </p>

              <p className="mt-1 truncate font-mono text-sm text-slate-200">
                {project.githubRepoFullName}
              </p>
            </div>

            {repositoryUrl && (
              <a
                href={repositoryUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
              >
                View repository
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-slate-900 p-2.5 text-slate-500">
                <Unplug size={21} />
              </div>

              <div>
                <p className="font-medium text-white">
                  No repository connected
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Add a GitHub repository URL through the project editor to
                  begin receiving deployment events.
                </p>
              </div>
            </div>

            <span className="mt-4 inline-flex rounded-full border border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-500">
              Disconnected
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

export default ProjectHeader;

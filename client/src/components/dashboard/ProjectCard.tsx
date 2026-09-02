import { useEffect, useState } from "react";
import { Trash2, Clock3, Pencil } from "lucide-react";

import type { Project } from "../../types/project";
import type { Deployment } from "../../types/deployment";

import deploymentService from "../../services/deploymentServices";
import StatusBadge from "../ui/StatusBadge";

type ProjectCardProps = {
  project: Project;
  onQuickView: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function ProjectCard({
  project,
  onQuickView,
  onOpen,
  onDelete,
  onEdit,
}: ProjectCardProps) {
  const [latestDeployment, setLatestDeployment] = useState<Deployment | null>(
    null,
  );

  useEffect(() => {
    const loadLatestDeployment = async () => {
      try {
        const deployments = await deploymentService.getDeployments(project.id);

        setLatestDeployment(deployments[0] ?? null);
      } catch (error) {
        console.error(`Failed to load deployments for ${project.name}`, error);
      }
    };

    void loadLatestDeployment();
  }, [project.id, project.name]);

  return (
    <article
      onClick={onOpen}
      className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900 p-5 transition hover:border-indigo-500/60 hover:bg-slate-900/80"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{project.name}</h3>

          <p className="mt-2 text-sm text-slate-400">
            {project.description ?? "No description"}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onEdit();
            }}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-500/10 hover:text-indigo-400"
            aria-label={`Edit ${project.name}`}
          >
            <Pencil size={18} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete();
            }}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Delete ${project.name}`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        {latestDeployment ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={latestDeployment.status} />

              <span className="text-xs font-medium text-slate-400">
                {latestDeployment.environment}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock3 size={14} />

              {new Date(latestDeployment.createdAt).toLocaleString()}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">No deployments yet</p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onQuickView();
          }}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm transition hover:bg-slate-800"
        >
          Quick view
        </button>

        {latestDeployment && (
          <span className="text-xs text-slate-500">
            {latestDeployment.branch ?? "main"}
          </span>
        )}
      </div>
    </article>
  );
}

export default ProjectCard;

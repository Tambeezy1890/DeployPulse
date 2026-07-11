import type { Project } from "../../types/project";
import StatusBadge from "../ui/StatusBadge";

type ProjectCardProps = {
  project: Project;
  onPreview: () => void;
  onOpen: () => void;
};

function ProjectCard({ project, onOpen, onPreview }: ProjectCardProps) {
  return (
    <article
      onClick={onOpen}
      className="cursor-pointer rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:border-indigo-400/50 hover:bg-slate-800"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{project.name}</h3>
          <p className="mt-1 text-sm capitalize text-slate-400">
            {project.environment}
          </p>
        </div>

        <StatusBadge status={project.status} />
      </div>

      <p className="mt-5 text-sm text-slate-400">
        Last deployed: {project.lastDeploy}
      </p>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onPreview();
        }}
        className="mt-4 rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
      >
        Quick view
      </button>
    </article>
  );
}

export default ProjectCard;

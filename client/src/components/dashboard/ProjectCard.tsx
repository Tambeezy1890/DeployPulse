import type { Project } from "../../types/project";

type ProjectCardProps = {
  project: Project;
  onQuickView: () => void;
  onOpen: () => void;
};

function ProjectCard({ project, onQuickView, onOpen }: ProjectCardProps) {
  return (
    <article
      className="rounded-xl border border-slate-700 bg-slate-900 p-5"
      onClick={onOpen}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{project.name}</h3>

          <p className="mt-1 capitalize text-slate-400">
            {project.environment}
          </p>
        </div>

        <span className="capitalize">{project.status}</span>
      </div>

      <p className="mt-5 text-sm text-slate-400">
        {project.description ?? "No description"}
      </p>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onQuickView();
        }}
        className="mt-5 rounded-lg border border-slate-700 px-3 py-2"
      >
        Quick view
      </button>
    </article>
  );
}

export default ProjectCard;

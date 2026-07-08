
import type { Project } from "../../types/project";

type ProjectCardProps  = {
    project: Project;
    onClick: ()=>void
}

function ProjectCard({project,onClick}: ProjectCardProps){
    return(
        <div className="rounded-xl border border-white/10 bg-white/5 p-4" 
        onClick={onClick}>
      <h2 className="text-xl font-semibold">{project.name}</h2>

      <p className="text-sm text-slate-300">
        Environment: {project.environment}
      </p>

      <p className="text-sm text-slate-300">Status: {project.status}</p>

      <p className="text-sm text-slate-400">
        Last deploy: {project.lastDeploy}
      </p>
    </div>
    )
}

export default ProjectCard
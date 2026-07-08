import type { ProjectOverview } from "../../types/dashboard"

type ProjectOverViewProps = {
    summary: ProjectOverview
}

function ProjectOverviewCard({summary}: ProjectOverViewProps) {
  return (
    <div className="flex flex-col">
      <div className="w-full px-2 py-4 bg-indigo-600/20">
       <p className="text-lg font-medium text-slate-100 tracking-widest">Total Projects <span>{summary.total}</span></p>
      </div>
     <div className="w-full px-2 py-4 bg-indigo-600/20">
       <p className="text-lg font-medium text-slate-100 tracking-widest">Healthy <span>{summary.healthy}</span></p>
      </div> 
      <div className="w-full px-2 py-4 bg-indigo-600/20">
       <p className="text-lg font-medium text-slate-100 tracking-widest">Failed Deployments <span>{summary.failed}</span></p>
       </div>
      <div className="w-full px-2 py-4 bg-indigo-600/20">
       <p className="text-lg font-medium text-slate-100 tracking-widest">Avg Uptime <span>{summary.uptime}</span></p>
      </div> 
      
      
    </div>
  )
}

export default ProjectOverviewCard

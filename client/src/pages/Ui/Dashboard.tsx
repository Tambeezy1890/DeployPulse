import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ProjectOverviewCard from "../../components/dashboard/ProjectOverview";
import { projects } from "../../data/project";
import { user } from "../../data/user";
import { overview } from "../../data/dashboard";
import ProjectCard from "../../components/dashboard/ProjectCard";
import { useDeploymentModal } from "../../hooks/useDeploymentModal";
import DeploymentModal from "../../components/modals/DeploymentModal";

function Dashboard(){
  const {deploymentModal, openDeploymentModal, closeDeploymentModal} =  useDeploymentModal({user})

    return (
        <main className="min-h-screen bg-slate-950 text-white p-6" >
        <DashboardHeader user={user}/>
       
          {deploymentModal.show? (<DeploymentModal project={deploymentModal.project} user={user} onClose={()=>closeDeploymentModal()}/>) : ""}

        <section className="mx-auto max-w-md bg-slate-900/50 rounded-2xl border border-slate-400 overflow-hidden mb-8">
            <ProjectOverviewCard summary={overview}/>
        </section>
      <section className="grid gap-4">
        {projects.map((project) => (
          <ProjectCard onClick={()=> openDeploymentModal(project)} key={project.id} project={project} />
        ))}
      </section>
    </main>
    )
}

export default Dashboard
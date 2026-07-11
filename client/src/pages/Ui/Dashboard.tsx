import DashboardHeader from "../../components/dashboard/DashboardHeader";

import { projects } from "../../data/project";
import { user } from "../../data/user";
import { overview } from "../../data/dashboard";
import ProjectCard from "../../components/dashboard/ProjectCard";
import { useDeploymentModal } from "../../hooks/useDeploymentModal";
import DeploymentModal from "../../components/modals/DeploymentModal";
import MetricCard from "../../components/dashboard/MetricCard";
import { useMemo, useState } from "react";
import type { Environment } from "../../types/project";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState<
    Environment | "all"
  >("all");
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesEnvironment =
        environmentFilter === "all" ||
        project.environment === environmentFilter;

      return matchesSearch && matchesEnvironment;
    });
  }, [searchTerm, environmentFilter]);
  const { deploymentModal, openDeploymentModal, closeDeploymentModal } =
    useDeploymentModal({ user });
  const navigate = useNavigate();
  return (
    <main className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-7xl p-6">
        <DashboardHeader user={user} />
        {deploymentModal.show && (
          <DeploymentModal
            project={deploymentModal.project}
            user={user}
            onClose={closeDeploymentModal}
          />
        )}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Projects" value={overview.total} />
          <MetricCard label="Healthy" value={overview.healthy} />
          <MetricCard label="Failed Deployments" value={overview.failed} />
          <MetricCard label="Average Uptime" value={overview.uptime} />
        </section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Projects</h2>
            <p className="text-sm text-slate-400">
              Monitor project health and deployment activity.
            </p>
          </div>
        </div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search projects..."
            className="flex-1 rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-indigo-400"
          />

          <select
            value={environmentFilter}
            onChange={(event) =>
              setEnvironmentFilter(event.target.value as Environment | "all")
            }
            className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 outline-none focus:border-indigo-400"
          >
            <option value="all">All environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
          </select>
        </div>

        <div className="space-y-2">
          <section className="grid gap-4">
            {filteredProjects.map((project) => (
              <ProjectCard
                onPreview={() => openDeploymentModal(project)}
                onOpen={() => navigate(`/projects/${project.id}`)}
                key={project.id}
                project={project}
              />
            ))}
          </section>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;

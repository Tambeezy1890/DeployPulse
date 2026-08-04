import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ProjectCard from "../../components/dashboard/ProjectCard";
import MetricCard from "../../components/dashboard/MetricCard";
import DeploymentModal from "../../components/modals/DeploymentModal";

import { user } from "../../data/user";

import { useDeploymentModal } from "../../hooks/useDeploymentModal";
import { useProject } from "../../contexts/ProjectContext";

import type { Environment } from "../../types/project";

function Dashboard() {
  const [search, setSearch] = useState("");

  const [environmentFilter, setEnvironmentFilter] = useState<
    Environment | "all"
  >("all");

  const navigate = useNavigate();

  const { projects, loading: isLoading, getProjects } = useProject();

  const { deploymentModal, openDeploymentModal, closeDeploymentModal } =
    useDeploymentModal({ user });

  useEffect(() => {
    void getProjects();
  }, [getProjects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesEnvironment =
        environmentFilter === "all" ||
        project.environment === environmentFilter;

      return matchesSearch && matchesEnvironment;
    });
  }, [projects, search, environmentFilter]);

  const projectMetrics = useMemo(() => {
    const total = projects.length;

    const healthy = projects.filter(
      (project) => project.status === "success",
    ).length;

    const failed = projects.filter(
      (project) => project.status === "failed",
    ).length;

    return {
      total,
      healthy,
      failed,
      uptime: "0%",
    };
  }, [projects]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Loading projects...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl p-6">
        <DashboardHeader user={user} />

        {deploymentModal.show && deploymentModal.project && (
          <DeploymentModal
            project={deploymentModal.project}
            user={user}
            onClose={closeDeploymentModal}
          />
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Projects" value={projectMetrics.total} />

          <MetricCard label="Healthy" value={projectMetrics.healthy} />

          <MetricCard
            label="Failed Deployments"
            value={projectMetrics.failed}
          />

          <MetricCard label="Average Uptime" value={projectMetrics.uptime} />
        </section>

        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Projects</h2>

            <p className="text-sm text-slate-400">
              Monitor project health and deployment activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/projects/new")}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            <Plus size={18} />
            Create Project
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />

          <select
            value={environmentFilter}
            onChange={(event) =>
              setEnvironmentFilter(event.target.value as Environment | "all")
            }
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-500"
          >
            <option value="all">All environments</option>
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>

        <section className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="text-slate-400">No projects found.</p>

              {projects.length === 0 && (
                <button
                  type="button"
                  onClick={() => navigate("/projects/new")}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-500"
                >
                  Create your first project
                </button>
              )}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onQuickView={() => openDeploymentModal(project)}
                onOpen={() => navigate(`/projects/${project.id}`)}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;

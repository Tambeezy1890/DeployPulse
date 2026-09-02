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

import deploymentService from "../../services/deploymentServices";

import type { Deployment } from "../../types/deployment";
import { useEditProjectModal } from "../../hooks/useEditProjectModal";
import EditProjectModal from "../../components/modals/EditProjectModal";

function Dashboard() {
  const [search, setSearch] = useState("");
  const [allDeployments, setAllDeployments] = useState<Deployment[]>([]);

  const navigate = useNavigate();

  const {
    projects,
    loading: isLoading,
    getProjects,
    deleteProject,
    updateProject,
  } = useProject();

  const { projectToEdit, openEditProjectModal, closeEditProjectModal } =
    useEditProjectModal();

  const { deploymentModal, openDeploymentModal, closeDeploymentModal } =
    useDeploymentModal({ user });

  useEffect(() => {
    void getProjects();
  }, [getProjects]);

  useEffect(() => {
    if (projects.length === 0) {
      setAllDeployments([]);
      return;
    }

    const loadDeployments = async () => {
      try {
        const deploymentResults = await Promise.all(
          projects.map((project) =>
            deploymentService.getDeployments(project.id),
          ),
        );

        setAllDeployments(deploymentResults.flat());
      } catch (error) {
        console.error("Failed to load dashboard deployments:", error);

        setAllDeployments([]);
      }
    };

    void loadDeployments();
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return projects.filter((project) =>
      project.name.toLowerCase().includes(searchValue),
    );
  }, [projects, search]);

  const totalDeployments = allDeployments.length;

  const failedDeployments = allDeployments.filter(
    (deployment) => deployment.status === "FAILED",
  ).length;

  const healthyProjects = projects.filter((project) => {
    const projectDeployments = allDeployments
      .filter((deployment) => deployment.projectId === project.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const latestDeployment = projectDeployments[0];

    return latestDeployment?.status === "SUCCESS";
  }).length;

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);

      setAllDeployments((previousDeployments) =>
        previousDeployments.filter(
          (deployment) => deployment.projectId !== projectId,
        ),
      );
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

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
        {projectToEdit && (
          <EditProjectModal
            project={projectToEdit}
            onClose={closeEditProjectModal}
            onSave={updateProject}
          />
        )}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Projects" value={projects.length} />

          <MetricCard label="Successful Projects" value={healthyProjects} />

          <MetricCard label="Failed Deployments" value={failedDeployments} />

          <MetricCard label="Total Deployments" value={totalDeployments} />
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

        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
          />
        </div>

        <section className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
              <p className="text-slate-400">
                {projects.length === 0
                  ? "No projects yet."
                  : "No projects match your search."}
              </p>

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
                onEdit={() => openEditProjectModal(project)}
                onDelete={() => void handleDeleteProject(project.id)}
              />
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default Dashboard;

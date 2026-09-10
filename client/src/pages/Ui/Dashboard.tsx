import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { Plus, Search } from "lucide-react";

import toast from "react-hot-toast";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import MetricCard from "../../components/dashboard/MetricCard";
import ProjectCard from "../../components/dashboard/ProjectCard";
import AttentionRequired from "../../components/dashboard/AttentionRequired";
import GitHubIntegrationPanel from "../../components/dashboard/GitHubIntegrationPanel";

import DeploymentModal from "../../components/modals/DeploymentModal";
import EditProjectModal from "../../components/modals/EditProjectModal";

import IncidentPanel from "../../components/incidents/IncidentPanel";
import IncidentDetailsModal from "../../components/incidents/IncidentDetailsModal";

import { useDeploymentModal } from "../../hooks/useDeploymentModal";
import { useEditProjectModal } from "../../hooks/useEditProjectModal";
import { useDashboardDeployments } from "../../hooks/useDashboardDeployments";
import { useDashboardView } from "../../hooks/useDashboardView";
import { useIncidents } from "../../hooks/useIncidents";

import { useProject } from "../../contexts/ProjectContext";
import { useAuth } from "../../contexts/AuthContext";

import type { Incident } from "../../types/incident";

function Dashboard() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );

  const { user, logout } = useAuth();

  const {
    projects,
    loading: projectsLoading,
    getProjects,
    deleteProject,
    updateProject,
  } = useProject();

  const { deploymentModal, openDeploymentModal, closeDeploymentModal } =
    useDeploymentModal({ user });

  const {
    projectToEdit,
    isEditProjectModalOpen,
    openEditProjectModal,
    closeEditProjectModal,
  } = useEditProjectModal();

  const {
    deployments,
    loading: deploymentsLoading,
    hasLoaded: hasLoadedDeployments,
    lastUpdatedAt,
    removeProjectDeployments,
  } = useDashboardDeployments(projects);

  const {
    openIncidents,
    loading: incidentsLoading,
    resolvingId,
    loadIncidents,
    resolveIncident,
  } = useIncidents();

  const { filteredProjects, metrics } = useDashboardView(
    projects,
    deployments,
    search,
  );

  useEffect(() => {
    void getProjects();
  }, [getProjects]);

  const openProject = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };

  const handleDeleteProject = async (
    projectId: string,
    projectName: string,
  ) => {
    const confirmed = window.confirm(
      `Delete "${projectName}"? This will also delete its deployments, health checks, and incidents.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(projectId);

      removeProjectDeployments(projectId);

      if (selectedIncident?.projectId === projectId) {
        setSelectedIncident(null);
      }

      await loadIncidents();

      toast.success("Project deleted");
    } catch (error) {
      console.error("Failed to delete project:", error);
      toast.error("Could not delete project");
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      await resolveIncident(incidentId);

      setSelectedIncident(null);

      toast.success("Incident resolved");
    } catch (error) {
      console.error("Failed to resolve incident:", error);
      toast.error("Could not resolve incident");
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await logout();

      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
      toast.error("Could not log out");
    } finally {
      setLoggingOut(false);
    }
  };

  if (projectsLoading && projects.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <DashboardHeader
          user={user}
          loggingOut={loggingOut}
          onLogout={handleLogout}
        />

        <GitHubIntegrationPanel />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total Projects" value={metrics.totalProjects} />

          <MetricCard
            label="Successful Projects"
            value={metrics.healthyProjects}
          />

          <MetricCard
            label="Failed Deployments"
            value={metrics.failedDeployments}
          />

          <MetricCard
            label="Total Deployments"
            value={metrics.totalDeployments}
          />
        </section>

        <IncidentPanel
          incidents={openIncidents}
          loading={incidentsLoading}
          onSelectIncident={setSelectedIncident}
          onOpenProject={openProject}
        />

        <AttentionRequired
          projects={projects}
          deployments={deployments}
          onOpenProject={openProject}
        />

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-bold text-white">Projects</h2>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Live updates every 15 seconds
                </div>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Monitor project health and deployment activity.
              </p>

              {lastUpdatedAt && (
                <p className="mt-1 text-xs text-slate-600">
                  Last updated{" "}
                  {lastUpdatedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/projects/new")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              Create Project
            </button>
          </div>

          <div className="relative mt-6">
            <Search
              size={20}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, repository or provider..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {deploymentsLoading && !hasLoadedDeployments ? (
            <div className="py-16 text-center">
              <p className="text-sm text-slate-400">Loading deployments...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 px-6 py-14 text-center">
              <h3 className="font-semibold text-white">
                {projects.length === 0
                  ? "No projects yet"
                  : "No matching projects"}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                {projects.length === 0
                  ? "Create your first project to begin monitoring deployments."
                  : "Try searching with a different project or repository name."}
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {filteredProjects.map((project) => {
                const projectDeployments = deployments.filter(
                  (deployment) => deployment.projectId === project.id,
                );

                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    deployments={projectDeployments}
                    onQuickView={() => openDeploymentModal(project)}
                    onOpen={() => openProject(project.id)}
                    onEdit={() => openEditProjectModal(project)}
                    onDelete={() =>
                      void handleDeleteProject(project.id, project.name)
                    }
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      {deploymentModal.show && (
        <DeploymentModal
          project={deploymentModal.project}
          user={deploymentModal.user}
          onClose={closeDeploymentModal}
        />
      )}

      {isEditProjectModalOpen && projectToEdit && (
        <EditProjectModal
          project={projectToEdit}
          onClose={closeEditProjectModal}
          onSave={updateProject}
        />
      )}

      {selectedIncident && (
        <IncidentDetailsModal
          incident={selectedIncident}
          resolving={resolvingId === selectedIncident.id}
          onClose={() => setSelectedIncident(null)}
          onResolve={() => void handleResolveIncident(selectedIncident.id)}
          onOpenProject={() => {
            const projectId = selectedIncident.projectId;

            setSelectedIncident(null);
            openProject(projectId);
          }}
        />
      )}
    </main>
  );
}

export default Dashboard;

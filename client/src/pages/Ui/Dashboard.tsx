import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import ProjectCard from "../../components/dashboard/ProjectCard";
import MetricCard from "../../components/dashboard/MetricCard";
import AttentionRequired from "../../components/dashboard/AttentionRequired";
import DeploymentModal from "../../components/modals/DeploymentModal";
import EditProjectModal from "../../components/modals/EditProjectModal";

import { useDeploymentModal } from "../../hooks/useDeploymentModal";
import { useEditProjectModal } from "../../hooks/useEditProjectModal";

import { useProject } from "../../contexts/ProjectContext";
import { useAuth } from "../../contexts/AuthContext";

import deploymentService from "../../services/deploymentServices";

import type { Deployment } from "../../types/deployment";

const DASHBOARD_POLL_INTERVAL = 15_000;

function Dashboard() {
  const [search, setSearch] = useState("");
  const [loadedDeployments, setLoadedDeployments] = useState<Deployment[]>([]);
  const [deploymentsLoading, setDeploymentsLoading] = useState(false);
  const [hasLoadedDeployments, setHasLoadedDeployments] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const {
    projects,
    loading: projectsLoading,
    getProjects,
    deleteProject,
    updateProject,
  } = useProject();

  const { projectToEdit, openEditProjectModal, closeEditProjectModal } =
    useEditProjectModal();

  const { deploymentModal, openDeploymentModal, closeDeploymentModal } =
    useDeploymentModal({ user });

  /*
   * Load the authenticated user's projects when the dashboard opens.
   */
  useEffect(() => {
    void getProjects();
  }, [getProjects]);

  /*
   * Load deployment data immediately and then refresh every 15 seconds.
   *
   * Polling pauses while the browser tab is hidden and immediately refreshes
   * when the user returns. requestInProgress prevents overlapping requests.
   */
  useEffect(() => {
    if (projects.length === 0) {
      return;
    }

    let cancelled = false;
    let requestInProgress = false;

    const loadDeployments = async () => {
      if (
        cancelled ||
        requestInProgress ||
        document.visibilityState === "hidden"
      ) {
        return;
      }

      requestInProgress = true;

      if (!hasLoadedDeployments) {
        setDeploymentsLoading(true);
      }

      try {
        const results = await Promise.allSettled(
          projects.map((project) =>
            deploymentService.getDeployments(project.id),
          ),
        );

        if (cancelled) {
          return;
        }

        const successfulResults = results
          .filter(
            (result): result is PromiseFulfilledResult<Deployment[]> =>
              result.status === "fulfilled",
          )
          .flatMap((result) => result.value ?? []);

        setLoadedDeployments(successfulResults);
        setHasLoadedDeployments(true);
        setLastUpdatedAt(new Date());

        const failedRequestCount = results.filter(
          (result) => result.status === "rejected",
        ).length;

        if (failedRequestCount > 0) {
          console.error(
            `Failed to update deployments for ${failedRequestCount} project(s).`,
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to refresh dashboard deployments:", error);
        }
      } finally {
        requestInProgress = false;

        if (!cancelled) {
          setDeploymentsLoading(false);
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadDeployments();
      }
    };

    void loadDeployments();

    const intervalId = window.setInterval(() => {
      void loadDeployments();
    }, DASHBOARD_POLL_INTERVAL);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [projects, hasLoadedDeployments]);

  /*
   * If all projects are removed, hide deployments from the previous project
   * list without synchronously updating state inside an effect.
   */
  const allDeployments = useMemo(
    () => (projects.length === 0 ? [] : loadedDeployments),
    [projects.length, loadedDeployments],
  );

  const filteredProjects = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return projects;
    }

    return projects.filter((project) => {
      const searchableValues = [
        project.name,
        project.description,
        project.repository,
        project.provider,
      ];

      return searchableValues.some((value) =>
        value?.toLowerCase().includes(searchValue),
      );
    });
  }, [projects, search]);

  const dashboardMetrics = useMemo(() => {
    const failedDeployments = allDeployments.filter(
      (deployment) => deployment.status === "FAILED",
    ).length;

    const healthyProjects = projects.filter((project) => {
      const latestDeployment = allDeployments
        .filter((deployment) => deployment.projectId === project.id)
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime(),
        )[0];

      return latestDeployment?.status === "SUCCESS";
    }).length;

    return {
      totalDeployments: allDeployments.length,
      failedDeployments,
      healthyProjects,
    };
  }, [projects, allDeployments]);

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);

      setLoadedDeployments((currentDeployments) =>
        currentDeployments.filter(
          (deployment) => deployment.projectId !== projectId,
        ),
      );
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to log out:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (projectsLoading && projects.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          user={user}
          loggingOut={loggingOut}
          onLogout={handleLogout}
        />

        {deploymentModal.show &&
          deploymentModal.project &&
          deploymentModal.user && (
            <DeploymentModal
              project={deploymentModal.project}
              user={deploymentModal.user}
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

          <MetricCard
            label="Successful Projects"
            value={dashboardMetrics.healthyProjects}
          />

          <MetricCard
            label="Failed Deployments"
            value={dashboardMetrics.failedDeployments}
          />

          <MetricCard
            label="Total Deployments"
            value={
              deploymentsLoading && !hasLoadedDeployments
                ? "..."
                : dashboardMetrics.totalDeployments
            }
          />
        </section>

        <AttentionRequired
          projects={projects}
          deployments={allDeployments}
          onOpenProject={(projectId) => navigate(`/projects/${projectId}`)}
        />

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold">Projects</h2>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Live updates every 15 seconds
                </div>
              </div>

              <p className="mt-1 text-sm text-slate-400">
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
            >
              <Plus size={18} />
              Create Project
            </button>
          </div>

          <div className="relative mb-6">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, repository or provider..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
            />
          </div>

          <div className="space-y-4">
            {filteredProjects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-10 text-center">
                <p className="text-slate-300">
                  {projects.length === 0
                    ? "You haven't created a project yet."
                    : "No projects match your search."}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {projects.length === 0
                    ? "Connect your first application to begin monitoring deployments."
                    : "Try searching with a different project name or repository."}
                </p>

                {projects.length === 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/projects/new")}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium transition hover:bg-indigo-500"
                  >
                    <Plus size={17} />
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
          </div>
        </section>
      </div>
    </main>
  );
}

export default Dashboard;

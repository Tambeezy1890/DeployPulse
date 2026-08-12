import { useEffect, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { Play, RefreshCw, Trash2 } from "lucide-react";

import { useProject } from "../../contexts/ProjectContext";
import { useDeployment } from "../../contexts/DeploymentContext";
import DeploymentPipeline from "../../components/ui/DeploymentPipeline";

import type { Environment } from "../../types/deployment";

function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  const {
    selectedProject: project,
    loading: projectLoading,
    getProjectById,
  } = useProject();

  const {
    deployments,
    loading: deploymentLoading,
    getDeployments,
    createDeployment,
    deleteDeployment,
  } = useDeployment();

  const [environment, setEnvironment] = useState<Environment>("DEVELOPMENT");

  const [branch, setBranch] = useState("main");

  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    void getProjectById(projectId);
    void getDeployments(projectId);
  }, [projectId, getProjectById, getDeployments]);
  useEffect(() => {
    if (!projectId) return;

    const hasActiveDeployment = deployments.some(
      (deployment) =>
        deployment.status === "PENDING" || deployment.status === "RUNNING",
    );

    if (!hasActiveDeployment) return;

    const interval = setInterval(() => {
      void getDeployments(projectId);
    }, 1500);

    return () => clearInterval(interval);
  }, [deployments, projectId, getDeployments]);
  const latestDeployment = deployments[0];
  const handleDeploy = async () => {
    if (!projectId) return;

    try {
      setDeploying(true);

      await createDeployment(projectId, {
        environment,
        branch,
        commitMessage: "Simulated DeployPulse deployment",
      });
    } finally {
      setDeploying(false);
    }
  };

  const handleRefresh = async () => {
    if (!projectId) return;

    await getDeployments(projectId);
  };

  const handleDelete = async (deploymentId: string) => {
    if (!projectId) return;

    await deleteDeployment(projectId, deploymentId);
  };

  if (projectLoading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        Loading project...
      </main>
    );
  }

  if (!projectId || !project) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Project not found.</p>

        <Link to="/dashboard" className="text-indigo-400">
          Back to dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/dashboard"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to dashboard
        </Link>

        <header className="mt-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>

            <p className="mt-2 max-w-xl text-slate-400">
              {project.description ?? "No description"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={environment}
              onChange={(event) =>
                setEnvironment(event.target.value as Environment)
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-indigo-500"
            >
              <option value="DEVELOPMENT">Development</option>

              <option value="STAGING">Staging</option>

              <option value="PRODUCTION">Production</option>
            </select>

            <input
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              placeholder="Branch"
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 outline-none focus:border-indigo-500"
            />

            <button
              type="button"
              onClick={handleDeploy}
              disabled={deploying}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <Play size={18} />

              {deploying ? "Starting..." : "Deploy"}
            </button>
          </div>
        </header>
        {latestDeployment && (
          <div className="mt-8">
            <DeploymentPipeline deployment={latestDeployment} />
          </div>
        )}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Deployment history</h2>

              <p className="mt-1 text-sm text-slate-400">
                {deployments.length} total
              </p>
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={deploymentLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-900"
            >
              <RefreshCw
                size={16}
                className={deploymentLoading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="mt-5 space-y-3">
            {deployments.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400">
                No deployments recorded for this project yet.
              </div>
            ) : (
              deployments.map((deployment) => (
                <article
                  key={deployment.id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold">
                          {deployment.branch ?? "Unknown branch"}
                        </h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            deployment.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : deployment.status === "FAILED"
                                ? "bg-red-500/10 text-red-400"
                                : deployment.status === "RUNNING"
                                  ? "bg-blue-500/10 text-blue-400"
                                  : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {deployment.status}
                        </span>
                      </div>

                      <p className="mt-2 text-sm text-slate-400">
                        {deployment.environment}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(deployment.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(deployment.id)}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  {deployment.durationMs !== null && (
                    <p className="mt-4 text-sm text-slate-400">
                      Duration: {(deployment.durationMs / 1000).toFixed(2)}s
                    </p>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProjectDetails;

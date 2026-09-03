import { Link, useParams } from "react-router-dom";
import { Play, RefreshCw } from "lucide-react";

import DeploymentPipeline from "../../components/ui/DeploymentPipeline";

import ProjectHeader from "../../components/projectDetails/ProjectHeader";
import DeploymentMetrics from "../../components/projectDetails/DeploymentMetrics";
import HealthMonitoringPanel from "../../components/projectDetails/HealthMonitoringPanel";
import DeploymentHistory from "../../components/projectDetails/DeploymentHistory";

import { useProjectDetails } from "../../hooks/useProjectDetails";
import DeleteDeploymentModal from "../../components/modals/DeleteDeploymentModal";

function ProjectDetails() {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const {
    project,
    projectLoading,
    deployments,
    deploymentLoading,
    health,
    healthLoading,
    loadHealth,
    handleRefresh,
    deploymentToDelete,
    deletingDeployment,
    requestDeploymentDelete,
    cancelDeploymentDelete,
    confirmDeploymentDelete,
  } = useProjectDetails(projectId);

  if (projectLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw size={18} className="animate-spin" />
          Loading project...
        </div>
      </main>
    );
  }

  if (!projectId || !project) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-white">
        <p className="text-lg font-medium">Project not found.</p>

        <Link
          to="/dashboard"
          className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
        >
          Back to dashboard
        </Link>
      </main>
    );
  }

  const latestDeployment = deployments[0];

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/dashboard"
          className="inline-flex text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to dashboard
        </Link>

        <ProjectHeader project={project} />

        <DeploymentMetrics deployments={deployments} />

        <HealthMonitoringPanel
          monitoringEnabled={project.monitoringEnabled}
          healthCheckUrl={project.healthCheckUrl}
          health={health}
          loading={healthLoading}
          onRefresh={() => void loadHealth()}
        />

        {latestDeployment ? (
          <div className="mt-6">
            <DeploymentPipeline deployment={latestDeployment} />
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-10 text-center">
            <Play size={28} className="mx-auto text-slate-600" />

            <h2 className="mt-3 font-semibold">No deployment activity</h2>

            <p className="mt-1 text-sm text-slate-500">
              Connect a repository to begin receiving deployment activity.
            </p>
          </div>
        )}

        <DeploymentHistory
          deployments={deployments}
          loading={deploymentLoading || healthLoading}
          onRefresh={() => void handleRefresh()}
          onDelete={requestDeploymentDelete}
        />
      </div>
      <DeleteDeploymentModal
        deployment={deploymentToDelete}
        deleting={deletingDeployment}
        onClose={cancelDeploymentDelete}
        onConfirm={() => {
          void confirmDeploymentDelete().catch(() => {
            // The provider restores the deployment and shows the error toast.
          });
        }}
      />
    </main>
  );
}

export default ProjectDetails;

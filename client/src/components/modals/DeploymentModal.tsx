import type { Project } from "../../types/project";
import type { User } from "../../types/user";

import { deployments } from "../../data/deployment";

type deploymentModalProps = {
  project: Project | null;
  user: User | null;
  onClose: () => void;
};

function DeploymentModal({ project, user, onClose }: deploymentModalProps) {
  if (!project || !user) return null;
  const projectDeployments = deployments.filter(
    (deployment) => deployment.projectId === project.id
  );
  return (
    <div
      className="fixed bg-slate-900/80 inset-0 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-indigo-600/90 rounded-xl p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl text-center mb-2">{project.name}</h2>
        <div className="bg-slate-400/70 px-4 py-2 rounded-md shadow-inner">
          <p className="text-slate-100 font-medium">Opened by: {user.name}</p>
          <p>Environment: {project.environment}</p>
          <p>Status: {project.status}</p>
          <p>Last deploy: {project.lastDeploy}</p>
        </div>
       
        <section className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Deployments</h3>

          <div className="space-y-2">
            {projectDeployments.map((deployment) => (
              <div
                key={deployment.id}
                className="rounded-lg bg-white/10 p-3 text-sm"
              >
                <p>{deployment.version}</p>
                <p>Status: {deployment.status}</p>
                <p>Environment: {deployment.environment}</p>
                <p>Duration: {deployment.duration}</p>
                <p>Triggered by: {deployment.triggeredBy}</p>
              </div>
            ))}
          </div>
        </section>
         <div className="flex justify-end">
          <button
            className="bg-rose-200 text-rose-500 rounded-lg px-2 mt-2"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeploymentModal;

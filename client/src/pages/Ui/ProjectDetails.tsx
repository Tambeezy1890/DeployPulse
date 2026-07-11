import { Link, useParams } from "react-router-dom";
import { projects } from "../../data/project";
import { deployments } from "../../data/deployment";
import StatusBadge from "../../components/ui/StatusBadge";

function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  const project = projects.find((item) => item.id === projectId);

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <p>Project not found.</p>
        <Link to="/" className="text-indigo-300">
          Return to dashboard
        </Link>
      </main>
    );
  }
  const projectDeployments = deployments.filter(
    (deployment) => deployment.projectId === project.id
  );
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <Link to="/" className="text-sm text-slate-400 hover:text-white">
          ← Back to dashboard
        </Link>

        <header className="mt-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="mt-2 capitalize text-slate-400">
              {project.environment}
            </p>
          </div>

          <StatusBadge status={project.status} />
        </header>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Deployment history</h2>

          <div className="mt-4 grid gap-3">
            {projectDeployments.map((deployment) => (
              <article
                key={deployment.id}
                className="rounded-xl border border-white/10 bg-slate-900 p-4"
              >
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-semibold">{deployment.version}</p>
                    <p className="text-sm text-slate-400">
                      {deployment.deployedAt}
                    </p>
                  </div>
                  <div className="">
                    <StatusBadge status={deployment.status} />
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-300">
                  Duration: {deployment.duration}
                </p>
                <p className="text-sm text-slate-300">
                  Triggered by: {deployment.triggeredBy}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProjectDetails;

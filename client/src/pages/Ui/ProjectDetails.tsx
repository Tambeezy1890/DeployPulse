import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import StatusBadge from "../../components/ui/StatusBadge";
import { useProject } from "../../contexts/ProjectContext";

function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();

  const { selectedProject: project, loading, getProjectById } = useProject();

  useEffect(() => {
    if (projectId) {
      void getProjectById(projectId);
    }
  }, [projectId, getProjectById]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <p className="text-slate-400">Loading project...</p>
      </main>
    );
  }

  if (!projectId || !project) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-7xl">
          <p>Project not found.</p>

          <Link
            to="/dashboard"
            className="mt-2 inline-block text-indigo-300 hover:text-indigo-200"
          >
            Return to dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/dashboard"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to dashboard
        </Link>

        <header className="mt-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>

            <p className="mt-2 capitalize text-slate-400">
              {project.environment}
            </p>

            {project.description && (
              <p className="mt-4 max-w-2xl text-slate-300">
                {project.description}
              </p>
            )}
          </div>

          <StatusBadge status={project.status} />
        </header>

        <section className="mt-8">
          <h2 className="text-xl font-semibold">Deployment history</h2>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-slate-400">
              No deployments recorded for this project yet.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProjectDetails;

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderPlus } from "lucide-react";
import toast from "react-hot-toast";

import { useProject } from "../../contexts/ProjectContext";
import type { Environment } from "../../types/project";

type ProjectFormState = {
  name: string;
  description: string;
  environment: Environment;
};

function CreateProject() {
  const navigate = useNavigate();
  const { createProject } = useProject();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ProjectFormState>({
    name: "",
    description: "",
    environment: "development",
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const projectName = formData.name.trim();

    if (!projectName) {
      toast.error("Project name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      await createProject({
        name: projectName,
        description: formData.description.trim() || undefined,
        environment: formData.environment,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl shadow-black/20">
          <div className="border-b border-slate-800 px-6 py-6 sm:px-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <FolderPlus size={24} />
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Create a new project
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Add a project to DeployPulse so that you can monitor its
              deployments, environment, and health.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 px-6 py-8 sm:px-8">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Project name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    name: event.target.value,
                  }))
                }
                placeholder="Example: Finance Tracker API"
                autoComplete="off"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Description
                <span className="ml-2 font-normal text-slate-500">
                  Optional
                </span>
              </label>

              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
                placeholder="Briefly describe what this project does..."
                disabled={isSubmitting}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <label
                htmlFor="environment"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Environment
              </label>

              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={(event) =>
                  setFormData((previous) => ({
                    ...previous,
                    environment: event.target.value as Environment,
                  }))
                }
                disabled={isSubmitting}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Select the environment where this project is currently deployed.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                disabled={isSubmitting}
                className="rounded-xl border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FolderPlus size={18} />

                {isSubmitting ? "Creating project..." : "Create project"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default CreateProject;

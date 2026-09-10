import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useNavigate } from "react-router-dom";

import { Activity, ArrowLeft, FolderPlus, LoaderCircle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import toast from "react-hot-toast";

import { useProject } from "../../contexts/ProjectContext";
import githubService from "../../services/githubServices";

import type { GitHubInstallation } from "../../services/githubServices";

type ProjectFormState = {
  name: string;
  description: string;
  githubRepositoryId: string;
  healthCheckUrl: string;
  monitoringEnabled: boolean;
};

function CreateProject() {
  const navigate = useNavigate();
  const { createProject } = useProject();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRepositories, setLoadingRepositories] = useState(true);
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);

  const [formData, setFormData] = useState<ProjectFormState>({
    name: "",
    description: "",
    githubRepositoryId: "",
    healthCheckUrl: "",
    monitoringEnabled: false,
  });

  const repositories = useMemo(
    () =>
      installations.flatMap((installation) =>
        installation.repositories.map((repository) => ({
          ...repository,
          accountLogin: installation.githubAccountLogin,
        })),
      ),
    [installations],
  );

  useEffect(() => {
    let cancelled = false;

    const loadRepositories = async () => {
      try {
        setLoadingRepositories(true);

        const data = await githubService.getInstallations();

        if (!cancelled) {
          setInstallations(data);
        }
      } catch (error) {
        console.error("Failed to load GitHub repositories:", error);

        if (!cancelled) {
          toast.error("Could not load GitHub repositories");
        }
      } finally {
        if (!cancelled) {
          setLoadingRepositories(false);
        }
      }
    };

    void loadRepositories();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateField = <K extends keyof ProjectFormState>(
    field: K,
    value: ProjectFormState[K],
  ) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const projectName = formData.name.trim();
    const healthCheckUrl = formData.healthCheckUrl.trim();

    if (!projectName) {
      toast.error("Project name is required");
      return;
    }

    try {
      setIsSubmitting(true);

      await createProject({
        name: projectName,
        description: formData.description.trim() || undefined,

        githubRepositoryId: formData.githubRepositoryId || undefined,

        healthCheckUrl: healthCheckUrl || undefined,

        monitoringEnabled: healthCheckUrl !== "" && formData.monitoringEnabled,
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 sm:py-10">
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

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Connect a repository and configure availability monitoring for
              your project.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 px-6 py-8 sm:px-8">
            <section>
              <div className="mb-5">
                <p className="text-sm font-semibold text-white">
                  Project information
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Basic information used throughout DeployPulse.
                </p>
              </div>

              <div className="space-y-5">
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
                    required
                    value={formData.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
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
                    rows={4}
                    value={formData.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Briefly describe what this project does..."
                    disabled={isSubmitting}
                    className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </section>

            <div className="border-t border-slate-800" />

            <section>
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-slate-300">
                  <FaGithub size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    GitHub integration
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Deployments from this repository will be matched
                    automatically.
                  </p>
                </div>
              </div>

              <label
                htmlFor="githubRepositoryId"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                GitHub repository
                <span className="ml-2 font-normal text-slate-500">
                  Optional
                </span>
              </label>

              {loadingRepositories ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-400">
                  <LoaderCircle size={18} className="animate-spin" />
                  Loading repositories...
                </div>
              ) : (
                <select
                  id="githubRepositoryId"
                  value={formData.githubRepositoryId}
                  onChange={(event) =>
                    updateField("githubRepositoryId", event.target.value)
                  }
                  disabled={isSubmitting || repositories.length === 0}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {repositories.length === 0
                      ? "No connected repositories available"
                      : "Select a repository"}
                  </option>

                  {repositories.map((repository) => (
                    <option key={repository.id} value={repository.id}>
                      {repository.fullName}
                      {repository.private ? " — Private" : ""}
                    </option>
                  ))}
                </select>
              )}

              {!loadingRepositories && repositories.length === 0 && (
                <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <p className="text-sm text-amber-300">
                    No GitHub repositories are connected.
                  </p>

                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="mt-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                  >
                    Return to the dashboard to connect GitHub
                  </button>
                </div>
              )}

              {formData.githubRepositoryId && (
                <p className="mt-2 text-xs text-emerald-400">
                  GitHub deployments will be matched automatically.
                </p>
              )}
            </section>

            <div className="border-t border-slate-800" />

            <section>
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Activity size={19} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Uptime monitoring
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    DeployPulse will periodically verify that the application is
                    available.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="healthCheckUrl"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Health-check URL
                    <span className="ml-2 font-normal text-slate-500">
                      Optional
                    </span>
                  </label>

                  <input
                    id="healthCheckUrl"
                    type="url"
                    value={formData.healthCheckUrl}
                    onChange={(event) => {
                      const value = event.target.value;

                      setFormData((previous) => ({
                        ...previous,
                        healthCheckUrl: value,
                        monitoringEnabled: value.trim()
                          ? previous.monitoringEnabled
                          : false,
                      }));
                    }}
                    placeholder="https://your-app.vercel.app/api/health"
                    disabled={isSubmitting}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
                  <span>
                    <span className="block text-sm font-medium text-white">
                      Enable monitoring
                    </span>

                    <span className="mt-1 block text-xs text-slate-500">
                      Requires a valid health-check URL.
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={formData.monitoringEnabled}
                    disabled={isSubmitting || !formData.healthCheckUrl.trim()}
                    onChange={(event) =>
                      updateField("monitoringEnabled", event.target.checked)
                    }
                    className="h-5 w-5 accent-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
                  />
                </label>
              </div>
            </section>

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
                disabled={isSubmitting || !formData.name.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <LoaderCircle size={18} className="animate-spin" />
                ) : (
                  <FolderPlus size={18} />
                )}

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

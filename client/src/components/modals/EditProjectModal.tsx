import { useEffect, useMemo, useState, type FormEvent } from "react";
import { LoaderCircle, X } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import type { Project, UpdateProjectData } from "../../types/project";
import type { GitHubInstallation } from "../../services/githubServices";
import githubService from "../../services/githubServices";

type EditProjectModalProps = {
  project: Project;
  onClose: () => void;
  onSave: (projectId: string, data: UpdateProjectData) => Promise<Project>;
};

function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [githubRepositoryId, setGitHubRepositoryId] = useState(
    project.githubRepositoryId ?? "",
  );
  const [healthCheckUrl, setHealthCheckUrl] = useState(
    project.healthCheckUrl ?? "",
  );
  const [monitoringEnabled, setMonitoringEnabled] = useState(
    project.monitoringEnabled,
  );

  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);
  const [loadingRepositories, setLoadingRepositories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setName(project.name);
    setDescription(project.description ?? "");
    setGitHubRepositoryId(project.githubRepositoryId ?? "");
    setHealthCheckUrl(project.healthCheckUrl ?? "");
    setMonitoringEnabled(project.monitoringEnabled);
  }, [project]);

  useEffect(() => {
    let cancelled = false;

    const loadRepositories = async () => {
      setLoadingRepositories(true);

      try {
        const data = await githubService.getInstallations();

        if (!cancelled) {
          setInstallations(data);
        }
      } catch (loadError) {
        console.error("Failed to load GitHub repositories:", loadError);

        if (!cancelled) {
          setError("Could not load your GitHub repositories.");
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSaving(true);

    try {
      await onSave(project.id, {
        name: name.trim(),
        description: description.trim() || null,
        githubRepositoryId: githubRepositoryId || null,
        healthCheckUrl: healthCheckUrl.trim() || null,
        monitoringEnabled: healthCheckUrl.trim() !== "" && monitoringEnabled,
      });

      onClose();
    } catch (saveError) {
      console.error("Could not update project:", saveError);
      setError("Could not update the project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit project</h2>

            <p className="mt-1 text-sm text-slate-400">
              Update project information and monitoring.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="block text-sm text-slate-300">
            Project name
            <input
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm text-slate-300">
            GitHub repository
            <div className="relative mt-2">
              {loadingRepositories ? (
                <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-400">
                  <LoaderCircle size={18} className="animate-spin" />
                  Loading repositories...
                </div>
              ) : (
                <>
                  <FaGithub
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />

                  <select
                    value={githubRepositoryId}
                    onChange={(event) =>
                      setGitHubRepositoryId(event.target.value)
                    }
                    className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="">No GitHub repository connected</option>

                    {repositories.map((repository) => (
                      <option key={repository.id} value={repository.id}>
                        {repository.fullName}
                        {repository.private ? " — Private" : ""}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
            {!loadingRepositories && repositories.length === 0 && (
              <span className="mt-2 block text-xs text-amber-400">
                Connect a GitHub repository from the dashboard first.
              </span>
            )}
            {githubRepositoryId && (
              <span className="mt-2 block text-xs text-emerald-400">
                GitHub deployments will be matched automatically.
              </span>
            )}
          </label>

          <label className="block text-sm text-slate-300">
            Health-check URL
            <input
              type="url"
              value={healthCheckUrl}
              onChange={(event) => setHealthCheckUrl(event.target.value)}
              placeholder="https://your-app.vercel.app/"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-950 p-4">
            <span>
              <span className="block text-sm text-white">
                Uptime monitoring
              </span>

              <span className="text-xs text-slate-400">
                Periodically check whether this project is online.
              </span>
            </span>

            <input
              type="checkbox"
              checked={monitoringEnabled}
              disabled={!healthCheckUrl.trim()}
              onChange={(event) => setMonitoringEnabled(event.target.checked)}
              className="h-5 w-5 accent-indigo-600 disabled:opacity-50"
            />
          </label>

          {error && (
            <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProjectModal;

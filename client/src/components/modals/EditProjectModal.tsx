import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Project, UpdateProjectData } from "../../types/project";

type EditProjectModalProps = {
  project: Project;
  onClose: () => void;
  onSave: (projectId: string, data: UpdateProjectData) => Promise<Project>;
};

function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [repository, setRepository] = useState(project.repository ?? "");
  const [healthCheckUrl, setHealthCheckUrl] = useState(
    project.healthCheckUrl ?? "",
  );
  const [monitoringEnabled, setMonitoringEnabled] = useState(
    project.monitoringEnabled,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(project.name);
    setDescription(project.description ?? "");
    setRepository(project.repository ?? "");
    setHealthCheckUrl(project.healthCheckUrl ?? "");
    setMonitoringEnabled(project.monitoringEnabled);
  }, [project]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSaving(true);

    try {
      await onSave(project.id, {
        name: name.trim(),
        description: description.trim() || null,
        repository: repository.trim() || null,
        healthCheckUrl: healthCheckUrl.trim() || null,
        monitoringEnabled: healthCheckUrl.trim() !== "" && monitoringEnabled,
      });

      onClose();
    } catch {
      setError("Could not update the project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-2xl border border-slate-700 bg-slate-900 p-6"
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit project</h2>

            <p className="mt-1 text-sm text-slate-400">
              Update project information and monitoring.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800"
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
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Repository URL
            <input
              type="url"
              value={repository}
              onChange={(event) => setRepository(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="block text-sm text-slate-300">
            Health-check URL
            <input
              type="url"
              value={healthCheckUrl}
              onChange={(event) => setHealthCheckUrl(event.target.value)}
              placeholder="https://your-app.vercel.app/"
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </label>

          <label className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950 p-4">
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
              className="h-5 w-5 accent-indigo-600"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditProjectModal;

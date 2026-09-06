import { useCallback, useEffect, useState } from "react";
import { ExternalLink, LoaderCircle, Lock } from "lucide-react";
import { FaGithub } from "react-icons/fa";

import githubService, {
  type GitHubInstallation,
} from "../../services/githubServices";

function GitHubIntegrationPanel() {
  const [installations, setInstallations] = useState<GitHubInstallation[]>([]);

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstallations = useCallback(async () => {
    try {
      setError(null);

      const data = await githubService.getInstallations();

      setInstallations(data);
    } catch (requestError) {
      console.error("Failed to load GitHub installations:", requestError);

      setError("GitHub connection information could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInstallations();
  }, [loadInstallations]);

  const handleConnect = async () => {
    if (connecting) {
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      const installUrl = await githubService.getInstallUrl();

      window.location.assign(installUrl);
    } catch (requestError) {
      console.error("Failed to begin GitHub installation:", requestError);

      setError("DeployPulse could not start the GitHub connection.");

      setConnecting(false);
    }
  };

  const repositoryCount = installations.reduce(
    (total, installation) => total + installation.repositories.length,
    0,
  );

  if (loading) {
    return (
      <section className="mb-8 flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <LoaderCircle size={20} className="animate-spin text-indigo-400" />

        <p className="text-sm text-slate-400">Loading GitHub integration...</p>
      </section>
    );
  }

  return (
    <section className="mb-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <header className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 text-white">
            <FaGithub size={24} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white">GitHub integration</h2>

              {installations.length > 0 && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  Connected
                </span>
              )}
            </div>

            <p className="mt-1 text-sm text-slate-400">
              {installations.length > 0
                ? `${repositoryCount} repositories available to DeployPulse.`
                : "Connect repositories to monitor real deployment activity."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={connecting}
          onClick={() => void handleConnect()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {connecting ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <FaGithub size={17} />
          )}

          {installations.length > 0 ? "Manage repositories" : "Connect GitHub"}
        </button>
      </header>

      {error && (
        <p className="border-b border-red-500/20 bg-red-500/5 px-5 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {installations.length > 0 && (
        <div className="divide-y divide-slate-800">
          {installations.map((installation) => (
            <article key={installation.id} className="p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-white">
                    {installation.githubAccountLogin}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {installation.githubAccountType} ·{" "}
                    {installation.repositorySelection}
                  </p>
                </div>

                <span className="text-xs text-slate-500">
                  {installation.repositories.length}{" "}
                  {installation.repositories.length === 1
                    ? "repository"
                    : "repositories"}
                </span>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {installation.repositories.map((repository) => (
                  <a
                    key={repository.id}
                    href={repository.htmlUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-3 transition hover:border-indigo-500/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-slate-200">
                        {repository.fullName}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        {repository.private && <Lock size={11} />}

                        {repository.private ? "Private" : "Public"}
                      </p>
                    </div>

                    <ExternalLink
                      size={14}
                      className="shrink-0 text-slate-500"
                    />
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default GitHubIntegrationPanel;

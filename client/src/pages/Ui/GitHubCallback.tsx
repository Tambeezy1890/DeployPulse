import { useEffect, useRef, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";

import githubService from "../../services/githubServices";

type CallbackStatus = "connecting" | "success" | "error";

function GitHubCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<CallbackStatus>("connecting");

  const [message, setMessage] = useState(
    "Verifying your GitHub installation...",
  );

  const requestStarted = useRef(false);

  useEffect(() => {
    if (requestStarted.current) {
      return;
    }

    requestStarted.current = true;

    const installationId = searchParams.get("installation_id");

    const state = searchParams.get("state");

    const setupAction = searchParams.get("setup_action");

    if (!installationId || !state) {
      setStatus("error");
      setMessage(
        "GitHub did not return the required installation information.",
      );

      return;
    }

    const completeInstallation = async () => {
      try {
        const installation = await githubService.completeInstallation(
          installationId,
          state,
        );

        setStatus("success");

        setMessage(
          `${installation.githubAccountLogin} connected with ${installation.repositories.length} repositories.`,
        );

        toast.success("GitHub connected successfully");

        window.setTimeout(() => {
          navigate("/dashboard", {
            replace: true,
            state: {
              githubConnected: true,
              setupAction,
            },
          });
        }, 1_500);
      } catch (error) {
        console.error("Failed to complete GitHub installation:", error);

        setStatus("error");

        setMessage(
          "DeployPulse could not verify this GitHub installation. Please try connecting again.",
        );

        toast.error("GitHub connection failed");
      }
    };

    void completeInstallation();
  }, [navigate, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
      <section className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl shadow-black/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950">
          {status === "connecting" && (
            <FaGithub size={30} className="animate-pulse text-indigo-400" />
          )}

          {status === "success" && (
            <CheckCircle2 size={30} className="text-emerald-400" />
          )}

          {status === "error" && <XCircle size={30} className="text-red-400" />}
        </div>

        <h1 className="mt-5 text-2xl font-semibold">
          {status === "connecting" && "Connecting GitHub"}

          {status === "success" && "GitHub connected"}

          {status === "error" && "Connection failed"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-400">{message}</p>

        {status === "connecting" && (
          <div className="mx-auto mt-6 h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500" />
        )}

        {status === "error" && (
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard", {
                replace: true,
              })
            }
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium transition hover:bg-indigo-500"
          >
            Return to dashboard
          </button>
        )}
      </section>
    </main>
  );
}

export default GitHubCallback;

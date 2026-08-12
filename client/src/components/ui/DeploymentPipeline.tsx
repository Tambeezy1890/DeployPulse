import { CheckCircle2, Circle, LoaderCircle, XCircle } from "lucide-react";

import type { Deployment } from "../../types/deployment";

type DeploymentPipelineProps = {
  deployment: Deployment;
};

const stages = [
  {
    key: "QUEUED",
    label: "Queued",
  },
  {
    key: "BUILD",
    label: "Build",
  },
  {
    key: "TEST",
    label: "Test",
  },
  {
    key: "DEPLOY",
    label: "Deploy",
  },
];

function DeploymentPipeline({ deployment }: DeploymentPipelineProps) {
  const getCurrentStage = () => {
    if (deployment.status === "PENDING") {
      return 0;
    }

    if (deployment.status === "RUNNING") {
      return 2;
    }

    if (deployment.status === "SUCCESS") {
      return 4;
    }

    if (deployment.status === "FAILED") {
      return 2;
    }

    return 0;
  };

  const currentStage = getCurrentStage();

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-indigo-400">
            Current deployment
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            {deployment.branch ?? "Unknown branch"}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {deployment.environment}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            deployment.status === "SUCCESS"
              ? "bg-emerald-500/10 text-emerald-400"
              : deployment.status === "FAILED"
                ? "bg-red-500/10 text-red-400"
                : deployment.status === "RUNNING"
                  ? "bg-blue-500/10 text-blue-400"
                  : "bg-amber-500/10 text-amber-400"
          }`}
        >
          {deployment.status}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-4 gap-3">
        {stages.map((stage, index) => {
          const complete = index < currentStage;
          const active =
            index === currentStage && deployment.status !== "SUCCESS";

          const failed =
            deployment.status === "FAILED" && index === currentStage;

          return (
            <div key={stage.key} className="relative">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                    failed
                      ? "border-red-500 bg-red-500/10 text-red-400"
                      : complete
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                        : active
                          ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                          : "border-slate-700 text-slate-600"
                  }`}
                >
                  {failed ? (
                    <XCircle size={20} />
                  ) : complete ? (
                    <CheckCircle2 size={20} />
                  ) : active ? (
                    <LoaderCircle size={20} className="animate-spin" />
                  ) : (
                    <Circle size={18} />
                  )}
                </div>

                <p
                  className={`mt-2 text-sm ${
                    complete || active ? "text-white" : "text-slate-500"
                  }`}
                >
                  {stage.label}
                </p>
              </div>

              {index < stages.length - 1 && (
                <div
                  className={`absolute left-[calc(50%+24px)] top-5 h-px w-[calc(100%-48px)] ${
                    index < currentStage ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm">
        {deployment.status === "PENDING" && (
          <>
            <p className="text-slate-400">&gt; Deployment queued...</p>

            <p className="mt-1 text-slate-500">&gt; Waiting for runner</p>
          </>
        )}

        {deployment.status === "RUNNING" && (
          <>
            <p className="text-slate-300">&gt; Installing dependencies...</p>

            <p className="mt-1 text-slate-300">&gt; Compiling TypeScript...</p>

            <p className="mt-1 text-indigo-400">
              &gt; Running deployment pipeline...
            </p>
          </>
        )}

        {deployment.status === "SUCCESS" && (
          <>
            <p className="text-emerald-400">
              &gt; Build completed successfully
            </p>

            <p className="mt-1 text-emerald-400">&gt; Deployment is live</p>
          </>
        )}

        {deployment.status === "FAILED" && (
          <>
            <p className="text-red-400">&gt; Deployment failed</p>

            <p className="mt-1 text-red-300">
              &gt; Pipeline exited with an error
            </p>
          </>
        )}
      </div>

      {deployment.durationMs !== null && (
        <p className="mt-4 text-sm text-slate-400">
          Completed in{" "}
          <span className="text-white">
            {(deployment.durationMs / 1000).toFixed(2)}s
          </span>
        </p>
      )}
    </section>
  );
}

export default DeploymentPipeline;

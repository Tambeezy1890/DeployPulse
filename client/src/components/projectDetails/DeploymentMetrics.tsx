import MetricCard from "../dashboard/MetricCard";

import type { Deployment } from "../../types/deployment";

type DeploymentMetricsProps = {
  deployments: Deployment[];
};

function DeploymentMetrics({ deployments }: DeploymentMetricsProps) {
  const successful = deployments.filter(
    (deployment) => deployment.status === "SUCCESS",
  ).length;

  const failed = deployments.filter(
    (deployment) => deployment.status === "FAILED",
  ).length;

  const finished = successful + failed;

  const successRate =
    finished === 0 ? 0 : Math.round((successful / finished) * 100);

  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total deployments" value={deployments.length} />

      <MetricCard label="Successful" value={successful} />

      <MetricCard label="Failed" value={failed} />

      <MetricCard label="Success rate" value={`${successRate}%`} />
    </section>
  );
}

export default DeploymentMetrics;

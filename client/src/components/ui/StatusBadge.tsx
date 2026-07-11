import type { DeploymentStatus } from "../../types/project";

type StatusBadgeProps = {
  status: DeploymentStatus;
};
function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<DeploymentStatus, string> = {
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    failed: "bg-red-500/15 text-red-300 border-red-500/30",
    pending: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;

import type { DeploymentStatus } from "../../types/deployment";

type StatusBadgeProps = {
  status: DeploymentStatus;
};

const statusStyles: Record<DeploymentStatus, string> = {
  SUCCESS: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  FAILED: "border-red-500/30 bg-red-500/15 text-red-300",
  RUNNING: "border-blue-500/30 bg-blue-500/15 text-blue-300",
  PENDING: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  CANCELLED: "border-slate-500/30 bg-slate-500/15 text-slate-300",
};

function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;

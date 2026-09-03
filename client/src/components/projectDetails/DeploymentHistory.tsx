import { RefreshCw } from "lucide-react";

import DeploymentFilters from "./DeploymentFilters";
import DeploymentRow from "./DeploymentRow";
import EmptyHistory from "./EmptyHistory";

import { useDeploymentFilters } from "../../hooks/useDeploymentFilters";

import type { Deployment } from "../../types/deployment";

type DeploymentHistoryProps = {
  deployments: Deployment[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (deploymentId: string) => void;
};

function DeploymentHistory({
  deployments,
  loading,
  onRefresh,
  onDelete,
}: DeploymentHistoryProps) {
  const {
    search,
    setSearch,
    environmentFilter,
    setEnvironmentFilter,
    statusFilter,
    setStatusFilter,
    sort,
    setSort,
    filteredDeployments,
    hasActiveFilters,
    clearFilters,
  } = useDeploymentFilters(deployments);

  return (
    <section className="mt-10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Deployment history</h2>

          <p className="mt-1 text-sm text-slate-400">
            Showing {filteredDeployments.length} of {deployments.length}{" "}
            deployments
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <DeploymentFilters
        search={search}
        onSearchChange={setSearch}
        environment={environmentFilter}
        onEnvironmentChange={setEnvironmentFilter}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        sort={sort}
        onSortChange={setSort}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      <div className="mt-5 space-y-3">
        {deployments.length === 0 ? (
          <EmptyHistory
            title="No deployments yet"
            message="Connect a repository to begin receiving deployment activity."
          />
        ) : filteredDeployments.length === 0 ? (
          <EmptyHistory
            title="No matching deployments"
            message="Change or clear your filters to see more results."
            onClear={clearFilters}
          />
        ) : (
          filteredDeployments.map((deployment) => (
            <DeploymentRow
              key={deployment.id}
              deployment={deployment}
              onDelete={() => onDelete(deployment.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default DeploymentHistory;

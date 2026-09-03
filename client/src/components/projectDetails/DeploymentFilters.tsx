import { ChevronDown, RotateCcw, Search } from "lucide-react";

import type { ReactNode } from "react";

import type {
  EnvironmentFilter,
  SortOption,
  StatusFilter,
} from "../../hooks/useDeploymentFilters";

type DeploymentFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;

  environment: EnvironmentFilter;
  onEnvironmentChange: (value: EnvironmentFilter) => void;

  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;

  sort: SortOption;
  onSortChange: (value: SortOption) => void;

  hasActiveFilters: boolean;
  onClear: () => void;
};

function DeploymentFilters({
  search,
  onSearchChange,
  environment,
  onEnvironmentChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  hasActiveFilters,
  onClear,
}: DeploymentFiltersProps) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_160px_160px_auto]">
        <div className="relative">
          <Search
            size={17}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search branch, commit or message..."
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
          />
        </div>

        <FilterSelect
          value={environment}
          onChange={(value) => onEnvironmentChange(value as EnvironmentFilter)}
          ariaLabel="Filter by environment"
        >
          <option value="ALL">All environments</option>
          <option value="DEVELOPMENT">Development</option>
          <option value="STAGING">Staging</option>
          <option value="PRODUCTION">Production</option>
        </FilterSelect>

        <FilterSelect
          value={status}
          onChange={(value) => onStatusChange(value as StatusFilter)}
          ariaLabel="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="FAILED">Failed</option>
          <option value="RUNNING">Running</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
        </FilterSelect>

        <FilterSelect
          value={sort}
          onChange={(value) => onSortChange(value as SortOption)}
          ariaLabel="Sort deployments"
        >
          <option value="NEWEST">Newest first</option>
          <option value="OLDEST">Oldest first</option>
        </FilterSelect>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasActiveFilters}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RotateCcw size={15} />
          Clear
        </button>
      </div>
    </div>
  );
}

type FilterSelectProps = {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: ReactNode;
};

function FilterSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={ariaLabel}
        className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 pr-9 text-sm outline-none transition focus:border-indigo-500"
      >
        {children}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}

export default DeploymentFilters;

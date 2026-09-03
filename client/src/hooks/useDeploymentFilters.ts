import { useMemo, useState } from "react";

import type { Deployment, Environment } from "../types/deployment";

export type EnvironmentFilter = "ALL" | Environment;

export type StatusFilter =
  | "ALL"
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED";

export type SortOption = "NEWEST" | "OLDEST";

export function useDeploymentFilters(deployments: Deployment[]) {
  const [search, setSearch] = useState("");

  const [environmentFilter, setEnvironmentFilter] =
    useState<EnvironmentFilter>("ALL");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const [sort, setSort] = useState<SortOption>("NEWEST");

  const filteredDeployments = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return [...deployments]
      .filter((deployment) => {
        const matchesSearch =
          !searchValue ||
          deployment.branch?.toLowerCase().includes(searchValue) ||
          deployment.commitMessage?.toLowerCase().includes(searchValue) ||
          deployment.commitSha?.toLowerCase().includes(searchValue);

        const matchesEnvironment =
          environmentFilter === "ALL" ||
          deployment.environment === environmentFilter;

        const matchesStatus =
          statusFilter === "ALL" || deployment.status === statusFilter;

        return matchesSearch && matchesEnvironment && matchesStatus;
      })
      .sort((first, second) => {
        const firstTime = new Date(first.createdAt).getTime();

        const secondTime = new Date(second.createdAt).getTime();

        return sort === "NEWEST"
          ? secondTime - firstTime
          : firstTime - secondTime;
      });
  }, [deployments, search, environmentFilter, statusFilter, sort]);

  const hasActiveFilters =
    search.trim() !== "" ||
    environmentFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    sort !== "NEWEST";

  const clearFilters = () => {
    setSearch("");
    setEnvironmentFilter("ALL");
    setStatusFilter("ALL");
    setSort("NEWEST");
  };

  return {
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
  };
}

import type { Deployment } from "../types/deployment";

export const deployments: Deployment[] =[
  {
    id: "dep1",
    projectId: "1",
    version: "v1.2.0",
    status: "success",
    environment: "development",
    deployedAt: "2026-07-08 21:45",
    duration: "2m 14s",
    triggeredBy: "Admin",
  },
  {
    id: "dep2",
    projectId: "2",
    version: "v0.9.4",
    status: "failed",
    environment: "staging",
    deployedAt: "2026-07-08 20:30",
    duration: "48s",
    triggeredBy: "Admin",
  },
  {
    id: "dep3",
    projectId: "1",
    version: "v1.4.0",
    status: "failed",
    environment: "production",
    deployedAt: "2026-07-08 21:45",
    duration: "2m 14s",
    triggeredBy: "Admin",
  },
]
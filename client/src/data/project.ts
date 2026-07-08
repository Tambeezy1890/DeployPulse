import type { Project } from "../types/project";
import type { Deployment } from "../types/project";
export const projects : Project[] = [
    {
    id: "1",
    name: "Finance Tracker API",
    environment: "production",
    status: "success",
    lastDeploy: "2026-07-07",
  },
  {
    id: "2",
    name: "TaskForge Frontend",
    environment: "staging",
    status: "pending",
    lastDeploy: "2026-07-06",
  },
]

export const deployments: Deployment[] =[
  {
    id: "dep1",
    projectId: "1",
    version: "v1.2.0",
    status: "success",
    environment: "production",
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
]
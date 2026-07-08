import type { DeploymentStatus, Environment } from "./project";

export type Deployment = {
   id: string,
   projectId: string,
   version: string, 
   status: DeploymentStatus,
   environment: Environment,
   deployedAt: string,
   duration: string,
   triggeredBy: string,
}
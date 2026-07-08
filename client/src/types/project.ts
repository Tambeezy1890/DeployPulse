
 export type Environment = "production" | "development" | "staging"

 export type DeploymentStatus = "success" | "failed" | "pending";

 export type Project = {
    id: string,
    name: string,
    environment: Environment,
    status: DeploymentStatus,
    lastDeploy: string
 }

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
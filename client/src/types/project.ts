
 export type Environment = "production" | "development" | "staging"

 export type DeploymentStatus = "success" | "failed" | "pending";

 export type Project = {
    id: string,
    name: string,
    environment: Environment,
    status: DeploymentStatus,
    lastDeploy: string
 }


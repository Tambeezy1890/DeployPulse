import type { ParamsDictionary } from "express-serve-static-core";
import type { Provider } from "../../../../generated/prisma/enums.js";

export interface CreateProjectBody {
  healthCheckUrl?: string | null;
  name: string;
  description?: string;
  repository?: string;
  provider?: Provider;
  monitoringEnabled?: boolean;
}

export interface UpdateProjectBody {
  name?: string;
  description?: string | null;
  repository?: string | null;
  provider?: Provider | null;
  healthCheckUrl?: string | null;
  monitoringEnabled?: boolean;
}

export interface ProjectParams extends ParamsDictionary {
  id: string;
}

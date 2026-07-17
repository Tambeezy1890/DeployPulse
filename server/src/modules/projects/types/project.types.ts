import type { ParamsDictionary } from "express-serve-static-core";
import type { Provider } from "../../../../generated/prisma/enums.js";

export interface CreateProjectBody {
  name: string;
  description?: string;
  repository?: string;
  provider?: Provider;
}

export interface UpdateProjectBody {
  name?: string;
  description?: string | null;
  repository?: string | null;
  provider?: Provider | null;
}

export interface ProjectParams extends ParamsDictionary {
  id: string;
}

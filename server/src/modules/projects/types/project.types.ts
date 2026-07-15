import { Provider } from "../../../../generated/prisma/enums.js";

export interface ProjectBody {
  name: string;
  description?: string;
  repository?: string;
  provider?: Provider;
}

export interface ProjectParams {
  id: string;
}

import api from "./api";

import type { ProjectHealth } from "../types/health";

const healthService = {
  getProjectHealth: async (projectId: string): Promise<ProjectHealth> => {
    const response = await api.get(`/projects/${projectId}/health-checks`);

    return response.data.health;
  },
};

export default healthService;

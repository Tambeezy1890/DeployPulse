import api from "./api";
import type {
  CreateProjectData,
  Project,
  UpdateProjectData,
} from "../types/project";

interface ProjectsResponse {
  success: boolean;
  message: string;
  projects: Project[];
}

interface ProjectResponse {
  success: boolean;
  message: string;
  project: Project;
}
const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get<ProjectsResponse>("/projects");

    return response.data.projects;
  },

  async getProjectById(projectId: string): Promise<Project> {
    const response = await api.get<ProjectResponse>(`/projects/${projectId}`);

    return response.data.project;
  },

  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await api.post<ProjectResponse>("/projects", data);

    return response.data.project;
  },

  async updateProject(
    projectId: string,
    data: UpdateProjectData,
  ): Promise<Project> {
    const response = await api.patch<ProjectResponse>(
      `/projects/${projectId}`,
      data,
    );

    return response.data.project;
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },
};
export default projectService;

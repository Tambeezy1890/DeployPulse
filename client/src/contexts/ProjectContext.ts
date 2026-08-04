import { createContext, useContext } from "react";

import type {
  CreateProjectData,
  Project,
  UpdateProjectData,
} from "../types/project";

export type ProjectContextType = {
  projects: Project[];
  selectedProject: Project | null;
  projectCount: number;
  loading: boolean;

  getProjects: () => Promise<void>;

  getProjectById: (projectId: string) => Promise<Project | null>;

  createProject: (data: CreateProjectData) => Promise<Project>;

  updateProject: (
    projectId: string,
    data: UpdateProjectData,
  ) => Promise<Project>;

  deleteProject: (projectId: string) => Promise<void>;
};

export const ProjectContext = createContext<ProjectContextType | undefined>(
  undefined,
);

export const useProject = () => {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error("useProject must be used inside ProjectProvider");
  }

  return context;
};

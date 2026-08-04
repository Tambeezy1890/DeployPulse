import { useCallback, useState, type ReactNode } from "react";
import toast from "react-hot-toast";

import { ProjectContext } from "./ProjectContext";
import projectService from "../services/projectServices";

import type {
  CreateProjectData,
  Project,
  UpdateProjectData,
} from "../types/project";

type ProjectProviderProps = {
  children: ReactNode;
};

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [loading, setLoading] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const getProjects = useCallback(async () => {
    setLoading(true);

    try {
      const projectData = await projectService.getProjects();

      setProjects(projectData ?? []);
      setProjectCount(projectData?.length ?? 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load projects");
      setProjects([]);
      setProjectCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectById = useCallback(
    async (projectId: string): Promise<Project | null> => {
      setLoading(true);

      try {
        const project = await projectService.getProjectById(projectId);
        console.log("PROJECTS FROM BACKEND:", project);
        setSelectedProject(project);

        return project;
      } catch (error) {
        console.error(error);
        toast.error("Failed to load project");

        setSelectedProject(null);

        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createProject = async (data: CreateProjectData): Promise<Project> => {
    const newProject = await projectService.createProject(data);

    setProjects((previousProjects) => [newProject, ...previousProjects]);

    toast.success("Project created");

    return newProject;
  };

  const updateProject = async (
    projectId: string,
    data: UpdateProjectData,
  ): Promise<Project> => {
    const updatedProject = await projectService.updateProject(projectId, data);

    setProjects((previousProjects) =>
      previousProjects.map((project) =>
        project.id === updatedProject.id ? updatedProject : project,
      ),
    );

    setSelectedProject((currentProject) =>
      currentProject?.id === updatedProject.id
        ? updatedProject
        : currentProject,
    );
    toast.success("Project updated");

    return updatedProject;
  };

  const deleteProject = async (projectId: string): Promise<void> => {
    await projectService.deleteProject(projectId);

    setProjects((previousProjects) =>
      previousProjects.filter((project) => project.id !== projectId),
    );

    setSelectedProject((currentProject) =>
      currentProject?.id === projectId ? null : currentProject,
    );

    toast.success("Project deleted");
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        selectedProject,
        projectCount,
        loading,
        getProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

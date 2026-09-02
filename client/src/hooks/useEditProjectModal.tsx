import { useState } from "react";
import type { Project } from "../types/project";

export function useEditProjectModal() {
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const openEditProjectModal = (project: Project) => {
    setProjectToEdit(project);
  };

  const closeEditProjectModal = () => {
    setProjectToEdit(null);
  };

  return {
    projectToEdit,
    isEditProjectModalOpen: projectToEdit !== null,
    openEditProjectModal,
    closeEditProjectModal,
  };
}

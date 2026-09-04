import { useState } from "react";

import type { User } from "../types/user";
import type { Project } from "../types/project";

type DeploymentModalState = {
  user: User | null;
  project: Project | null;
  show: boolean;
};

type UseDeploymentModalArgs = {
  user: User | null;
};

const initialState: DeploymentModalState = {
  user: null,
  project: null,
  show: false,
};

export function useDeploymentModal({ user }: UseDeploymentModalArgs) {
  const [deploymentModal, setDeploymentModal] =
    useState<DeploymentModalState>(initialState);

  function closeDeploymentModal() {
    setDeploymentModal(initialState);
  }

  function openDeploymentModal(project: Project) {
    if (!user) {
      return;
    }

    setDeploymentModal({
      user,
      project,
      show: true,
    });
  }

  return {
    deploymentModal,
    closeDeploymentModal,
    openDeploymentModal,
  };
}

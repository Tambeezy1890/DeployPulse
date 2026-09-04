import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";

import { AuthProvider } from "./contexts/AuthProvider";
import { ProjectProvider } from "./contexts/ProjectProvider";
import { DeploymentProvider } from "./contexts/DeploymentProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <ProjectProvider>
        <DeploymentProvider>
          <App />
        </DeploymentProvider>
      </ProjectProvider>
    </AuthProvider>
  </StrictMode>,
);

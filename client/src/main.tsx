import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import App from "./App.tsx";
import { ProjectProvider } from "./contexts/ProjectProvider.tsx";
import { DeploymentProvider } from "./contexts/DeploymentProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProjectProvider>
      <DeploymentProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </DeploymentProvider>
    </ProjectProvider>
  </StrictMode>,
);

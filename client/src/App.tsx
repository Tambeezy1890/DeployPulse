import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/auth/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Ui/Dashboard";
import ProjectDetails from "./pages/Ui/ProjectDetails";
import CreateProject from "./pages/Ui/CreateProject";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#0f172a",
            color: "#fff",
            border: "1px solid #334155",
          },
        }}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects/new" element={<CreateProject />} />

          <Route path="/projects/:projectId" element={<ProjectDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

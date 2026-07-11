import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Ui/Dashboard";
import ProjectDetails from "./pages/Ui/ProjectDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects/:projectId" element={<ProjectDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import LandingPage from "./pages/LandingPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import IssueCreatePage from "./pages/IssueCreatePage";
import IssueDetailPage from "./pages/IssueDetailPage";
import AppMapPage from "./pages/AppMapPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing - no layout */}
        <Route path="/" element={<LandingPage />} />

        {/* App routes with sidebar layout */}
        <Route element={<AppLayout />}>
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route
            path="/projects/:projectId/issues/new"
            element={<IssueCreatePage />}
          />
          <Route path="/projects/:projectId/app-map" element={<AppMapPage />} />
          <Route path="/issues/:issueId" element={<IssueDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

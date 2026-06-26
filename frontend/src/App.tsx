import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import IssueCreatePage from "./pages/IssueCreatePage";
import IssueDetailPage from "./pages/IssueDetailPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/projects" replace />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route
            path="/projects/:projectId/issues/new"
            element={<IssueCreatePage />}
          />
          <Route path="/issues/:issueId" element={<IssueDetailPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

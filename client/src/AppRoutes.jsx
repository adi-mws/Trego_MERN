import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import ScrollToTop from "./components/global/ScrollToTop";
import HomePage from "./components/marketing/home/HomePage";
import AlertContainer from "./components/global/AlertContainer";
import MarketingLayout from "./layouts/MarketingLayout";
import SignUpForm from "./components/features/auth/SignUpForm";
import SignInForm from "./components/features/auth/SignInForm";
import WorkspacesLayout from "./layouts/WorkspacesLayout";
import WorkspaceListPage from "./components/features/workspaces/WorkspaceListPage";
import NotificationsPage from "./components/features/notifications/NotificationsPage";
import useVerifyAuth from "./hooks/useVerifyAuth";
import AppLayout from "./layouts/AppLayout";
import WorkspaceDetailLayout from "./layouts/WorkspaceDetailLayout";
import WorkspaceOverviewPage from "./components/features/workspaces/WorkspaceOverviewPage";
import WorkspaceSettingsPage from "./components/features/workspaces/WorkspaceSettingsPage";
import ProjectLayout from "./layouts/ProjectLayout";
import JoinWorkspace from "./components/features/workspaces/_components/JoinWorkspace";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import WorkspaceMemberPage from "./components/features/workspaces/WorkspaceMemberPage";
import WorkspaceProjectsPage from "./components/features/workspaces/WorkspaceProjectsPage";
import ProjectSettings from "./components/features/projects/ProjectSettings";
import ProjectOverview from "./components/features/projects/ProjectOverview";
import ProjectMembers from "./components/features/projects/ProjectMembers";
import ProjectTaskBoard from "./components/features/projects/ProjectTaskBoard";
import ProjectTasks from "./components/features/projects/ProjectTasks";
import ProjectGantt from "./components/features/projects/ProjectGantt";
import ProjectWorkflow from "./components/features/projects/ProjectWorkflow";


export default function AppRoutes() {
  useVerifyAuth();

  return (
    <>
      <AlertContainer />
      <Router>
        <ScrollToTop />
        <Routes>
          {/* PUBLIC (but restricted when logged in) */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<MarketingLayout />}>
              <Route index element={<HomePage />} />
              <Route path="sign-up" element={<SignUpForm />} />
              <Route path="sign-in" element={<SignInForm />} />
            </Route>
          </Route>

          {/* PUBLIC (allowed even if logged in) */}
          <Route element={<PublicRoute allowAuthenticated={true} />}>
            <Route path="/join/workspace/:inviteCode" element={<JoinWorkspace />} />
          </Route>

          {/* PROTECTED */}
          <Route element={<ProtectedRoute />}>
            <Route path="/app" element={<AppLayout />}>
              <Route element={<WorkspacesLayout />}>
                <Route index element={<WorkspaceListPage />} />
              </Route>

              <Route path=":workspaceSlug" element={<WorkspaceDetailLayout />}>
                <Route index element={<WorkspaceOverviewPage />} />
                <Route path="members" element={<WorkspaceMemberPage />} />
                <Route path="settings" element={<WorkspaceSettingsPage />} />
                <Route path="projects" element={<WorkspaceProjectsPage />} />
                <Route path="projects/:projectSlug" element={<ProjectLayout />}>
                  <Route index element={<ProjectOverview />} />
                  <Route path="tasks" element={<ProjectTasks />} />
                  <Route path="board" element={<ProjectTaskBoard />} />
                  <Route path="members" element={<ProjectMembers />} />
                  <Route path="gantt" element={<ProjectGantt />} />
                  <Route path="workflow" element={<ProjectWorkflow />} />
                  <Route path="settings" element={<ProjectSettings />} />
                </Route>
              </Route>

              <Route path="notifications" element={<WorkspacesLayout />}>
                <Route index element={<NotificationsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}
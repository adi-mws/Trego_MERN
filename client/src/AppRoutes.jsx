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
import ProjectClientChatPage from "./components/features/projects/ProjectClientChatPage";
import ProjectMembers from "./components/features/projects/ProjectMembers";
import ProjectTaskBoard from "./components/features/projects/ProjectTaskBoard";
import ProjectTasks from "./components/features/projects/ProjectTasks";
import ProjectWorkflow from "./components/features/projects/ProjectWorkflow";
import ProjectRoles from "./components/features/projects/ProjectRoles";
import ProjectTaskStateHistory from "./components/features/projects/ProjectTaskStateHistory";
import ProjectTimeline from "./components/features/projects/ProjectTimeline";
import ProjectWorkflowsList from "./components/features/projects/ProjectWorkflowsList";
import TaskCategories from "./components/features/tasks/TaskCategories";
import TaskView from "./components/features/tasks/TaskView";
import ProjectComments from "./components/features/tasks/ProjectComments";
import GlobalAgentChatPanel from "./components/features/agent/GlobalAgentChatPanel";


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
                <Route path="agent" element={<GlobalAgentChatPanel />} />
                <Route path="members" element={<WorkspaceMemberPage />} />
                <Route path="settings" element={<WorkspaceSettingsPage />} />
                <Route path="projects" element={<WorkspaceProjectsPage />} />
                <Route path="projects/:projectSlug" element={<ProjectLayout />}>
                  <Route index element={<ProjectOverview />} />
                  <Route path="chat" element={<ProjectClientChatPage />} />
                  <Route path="tasks" element={<ProjectTasks />} />
                  <Route path="roles" element={<ProjectRoles />} />
                  <Route path="board" element={<ProjectTaskBoard />} />
                  <Route path="members" element={<ProjectMembers />} />
                  <Route path="task-categories" element={<TaskCategories />} />
                  <Route path="workflows" element={<ProjectWorkflowsList />} />
                  <Route path="workflows/:workflowId" element={<ProjectWorkflow />} />
                  <Route path="settings" element={<ProjectSettings />} />
                  <Route path="timeline" element={<ProjectTimeline />} />
                  <Route path="task-state-history" element={<ProjectTaskStateHistory />} />
                  <Route path="tasks/:taskId" element={<TaskView />} />
                  <Route path="comments" element={<ProjectComments />} />
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

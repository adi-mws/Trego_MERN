import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import ScrollToTop from "./components/global/ScrollToTop";
import HomePage from "./components/marketing/home/HomePage";
import ConfirmDialog from "./components/global/ConfirmDialog";
import AlertContainer from "./components/global/AlertContainer";

import MarketingLayout from "./layouts/MarketingLayout";
import SignUpForm from "./components/features/auth/SignUpForm";
import SignInForm from "./components/features/auth/SignInForm";

import WorkspacesLayout from "./layouts/WorkspacesLayout";
import WorkspaceListPage from "./components/features/workspaces/WorkspaceListPage";
import NotificationsPage from "./components/features/notifications/NotificationsPage";

import useVerifyAuth from "./hooks/useVerifyAuth";
import AppLayout from "./layouts/AppLayout";


export default function AppRoutes() {
  useVerifyAuth();

  return (
    <>
      {/* GLOBAL UI */}

      <AlertContainer />
      <ConfirmDialog />

      <Router>
        <ScrollToTop />

        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<MarketingLayout />}>
            <Route index element={<HomePage />} />
            <Route path="sign-up" element={<SignUpForm />} />
            <Route path="sign-in" element={<SignInForm />} />
          </Route>

          {/* PROTECTED */}
          <Route path="/app" element={<AppLayout />}>
            <Route element={<WorkspacesLayout />}>
              <Route index element={<WorkspaceListPage />} />
            </Route>

            <Route path="notifications" element={<WorkspacesLayout />}>
              <Route index element={<NotificationsPage />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}
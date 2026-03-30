import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/global/ScrollToTop";
import HomePage from "./components/marketing/home/HomePage";
import ConfirmDialog from "./components/global/ConfirmDialog";
import AlertContainer from "./components/global/AlertContainer"
import MarketingLayout from "./components/marketing/MarketingLayout";
import SignUpForm from "./components/features/auth/SignUpForm";
import SignInForm from "./components/features/auth/SignInForm";
import WorkspacesLayout from "./components/dashboard/WorkspacesLayout";
import WorkspaceListPage from "./components/features/workspaces/WorkspaceListPage";
import NotificationsPage from "./components/features/notifications/NotificationsPage";
export default function AppRoutes() {

  return (
    <>
      {/* GLOBAL UI (always mounted) */}
      <AlertContainer />
      <ConfirmDialog />

      <Router>
        <ScrollToTop />
        <Routes>
          {/*  PUBLIC ROUTES  */}
          <Route path='/' element={<MarketingLayout />}>
            <Route index element={<HomePage />
            } />
            <Route path="sign-up" element={<SignUpForm />} />
            <Route path="sign-in" element={<SignInForm />} />
          </Route>

          <Route path="/app" element={<WorkspacesLayout />}>
            <Route index element={<WorkspaceListPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>

        </Routes>

      </Router>
    </>
  );
}

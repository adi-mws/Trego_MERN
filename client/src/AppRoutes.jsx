import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/global/ScrollToTop";
import HomePage from "./components/marketing/home/HomePage";
import ConfirmDialog from "./components/global/ConfirmDialog";
import AlertContainer from "./components/global/AlertContainer"
import MarketingLayout from "./components/marketing/MarketingLayout";
/*  ROUTES  */

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
            <Route index element={<HomePage />} />

          </Route>
        </Routes>

      </Router>
    </>
  );
}

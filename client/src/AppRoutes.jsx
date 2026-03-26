import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "./components/global/ScrollToTop";
import HomePage from "./components/marketing/home/HomePage";
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
          <Route path="/" element={<HomePage />} />
        </Routes>

      </Router>
    </>
  );
}

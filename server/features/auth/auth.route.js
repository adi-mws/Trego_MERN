// routes/auth.routes.js

import express from "express";
import {
  signInController,
  signUpController,
  signInGoogleController,
  signOut,
  signOutDevice,
  signOutAll,
} from "../controllers/auth.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// AUTH (PUBLIC)

// Sign in (LOCAL)
router.post("/signin", signInController);

// Sign up (LOCAL)
router.post("/signup", signUpController);

// Sign in with Google
router.post("/google", signInGoogleController);

// AUTH (PROTECTED)

// Sign out current session
router.post("/signout", authMiddleware, signOut);

// Sign out specific device/session
router.delete("/sessions/:sessionId", authMiddleware, signOutDevice);

// Sign out from all sessions
router.post("/signout-all", authMiddleware, signOutAll);

export default router;
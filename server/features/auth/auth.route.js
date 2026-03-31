// routes/auth.routes.js

import express from "express";
import {
  signInController,
  signUpController,
  signInGoogleController,
  signOut,
  signOutDevice,
  signOutAll,
  authVerifyController
} from "../auth/auth.controller.js";

import ensureAuth from "../../middlewares/ensureAuth.js";

const router = express.Router();

// AUTH (PUBLIC)

// Sign in (LOCAL)
router.post("/sign-in", signInController);

// Sign up (LOCAL)
router.post("/sign-up", signUpController);

// Sign in with Google
router.post("/google", signInGoogleController);

// AUTH (PROTECTED)

// Sign out current session
router.post("/sign-out", ensureAuth, signOut); 

// Sign out specific device/session
router.delete("/sessions/:sessionId", ensureAuth, signOutDevice); 

// Sign out from all sessions
router.post("/sign-out-all", ensureAuth, signOutAll); 


router.get("/verify", ensureAuth, authVerifyController);

export default router;
import express from "express";
import * as workspaceController from "./workspace.controller.js";
import ensureAuth from "../../middlewares/ensureAuth.js";
import { createUploader } from "../../middlewares/multer.js";

const router = express.Router();

const uploadAvatar = createUploader(
  "avatars",
  "single",
  "avatar",
  1,
  ["image/jpeg", "image/png", "image/webp"],
  true,
  { width: 400, height: 400, quality: 80 }
);


// Create workspace
router.post("/", ensureAuth, uploadAvatar, workspaceController.createWorkspace);

// Get all workspaces of user (basic list)
router.get("/", ensureAuth, workspaceController.getUserWorkspaces);

// Generate invite link for workspace
router.post("/invite", ensureAuth, workspaceController.generateWorkspaceInviteController);
// Join workspace via invite code
router.post("/join/:code", ensureAuth, workspaceController.joinWorkspaceByInviteController);


router.post(
  "/members/profile",
  ensureAuth,
  workspaceController.getWorkspaceMemberProfileController
);

// Infinite scroll list (cursor-based)
router.get(
  "/list",
  ensureAuth,
  workspaceController.getWorkspaceListController
);

router.get(
  "/global/:slug",
  ensureAuth,
  workspaceController.getWorkspaceGlobalStateController
);

// Get workspace by slug
router.get(
  "/slug/:slug",
  ensureAuth,
  workspaceController.getWorkspaceBySlug
);

// Get workspace by ID
router.get("/:id", ensureAuth, workspaceController.getWorkspace);

// Update workspace
router.put("/:id", ensureAuth, uploadAvatar, workspaceController.updateWorkspace);

// Delete workspace
router.delete("/:id", ensureAuth, workspaceController.deleteWorkspace);

export default router;
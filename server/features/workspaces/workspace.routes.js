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

// Infinite scroll list (cursor-based)
router.get(
  "/list",
  ensureAuth,
  workspaceController.getWorkspaceListController
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
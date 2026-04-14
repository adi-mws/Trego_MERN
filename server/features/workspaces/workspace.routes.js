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


router.post("/", ensureAuth, uploadAvatar, workspaceController.createWorkspaceController);
router.get("/", ensureAuth, workspaceController.getUserWorkspacesController);

router.post("/invite", ensureAuth, workspaceController.generateWorkspaceInviteController);
router.post("/join/:code", ensureAuth, workspaceController.joinWorkspaceByInviteController);

router.post("/members/profile", ensureAuth, workspaceController.getWorkspaceMemberProfileController);

router.get("/list", ensureAuth, workspaceController.getWorkspaceListController);

router.get("/global/:slug", ensureAuth, workspaceController.getWorkspaceGlobalStateController);
router.get("/slug/:slug", ensureAuth, workspaceController.getWorkspaceBySlug);

router.get("/:workspaceId/members", ensureAuth, workspaceController.getWorkspaceMembersSummaryController);
router.get("/:workspaceId/members-list", ensureAuth, workspaceController.getWorkspaceMembersByRoleController);
router.post("/:workspaceId/members-roles", ensureAuth, workspaceController.updateWorkspaceMemberRoleController);


router.get("/:id", ensureAuth, workspaceController.getWorkspace);
router.put("/:id", ensureAuth, uploadAvatar, workspaceController.updateWorkspace);
router.delete("/:id", ensureAuth, workspaceController.deleteWorkspace);

export default router;
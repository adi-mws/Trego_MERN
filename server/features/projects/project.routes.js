import express from "express";
import {
  createProjectController,
  createProjectMemberController,
  createProjectRoleController,
  getProjectMemberController,
  getProjectMembersController,
  getProjectRoleController,
  removeMultipleProjectMemberController,
  removeProjectMemberController,
  createMultipleProjectRoleController,
  getAllProjectRolesController,
  updateProjectRoleController,
  deleteProjectRoleController,
  getProjectGlobalStateBySlugController,
  updateProjectMemberRolesController, 
  updateProjectController,
} from "./project.controller.js";
import { getProjectMetrics } from "./projectMetrics.controller.js";

import { createUploader } from "../../middlewares/multer.js";
import ensureAuth from "../../middlewares/ensureAuth.js";

const router = express.Router();

/* Upload Config */
const uploadAvatar = createUploader(
  "avatars",
  "single",
  "avatar",
  1,
  ["image/jpeg", "image/png", "image/webp"],
  true,
  { width: 400, height: 400, quality: 80 }
);

router.post("/", ensureAuth, uploadAvatar, createProjectController);
router.put("/:projectId", ensureAuth, uploadAvatar, updateProjectController);
router.get("/global/:slug", ensureAuth, getProjectGlobalStateBySlugController);

router.post("/:projectId/roles", ensureAuth, createProjectRoleController);
router.post("/:projectId/roles/multiple", ensureAuth, createMultipleProjectRoleController);

router.get("/:projectId/roles", ensureAuth, getAllProjectRolesController);
router.get("/:projectId/roles/:roleId", ensureAuth, getProjectRoleController);

router.put("/:projectId/roles/:roleId", ensureAuth, updateProjectRoleController);
router.delete("/:projectId/roles/:roleId", ensureAuth, deleteProjectRoleController);

router.post("/:projectId/members", ensureAuth, createProjectMemberController);

router.get("/:projectId/members", ensureAuth, getProjectMembersController);
router.get("/:projectId/members/:memberId", ensureAuth, getProjectMemberController);

router.put(
  "/:projectId/members/:memberId/roles",
  ensureAuth,
  updateProjectMemberRolesController 
);

router.delete("/:projectId/members/:memberId", ensureAuth, removeProjectMemberController);
router.delete("/:projectId/members", ensureAuth, removeMultipleProjectMemberController);

router.get("/:projectId/metrics", ensureAuth, getProjectMetrics);

export default router;
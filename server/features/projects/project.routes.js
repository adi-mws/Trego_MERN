import express from "express";
import {
    createProjectController, createProjectMemberController,
    createProjectRoleController, getProjectMemberController,
    getProjectMembersController, getProjectRoleController,
    removeMultipleProjectMemberController, removeProjectMemberController,
    createMultipleProjectRoleController,
    getAllProjectRolesController, updateProjectRoleController, deleteProjectRoleController,
    getProjectGlobalStateBySlugController
} from "./project.controller.js";
import { createUploader } from "../../middlewares/multer.js";
import ensureAuth from "../../middlewares/ensureAuth.js"
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


router.post("/", ensureAuth, uploadAvatar, createProjectController);

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
router.delete("/:projectId/members/:memberId", ensureAuth, removeProjectMemberController);
router.delete("/:projectId/members", ensureAuth, removeMultipleProjectMemberController);

export default router;
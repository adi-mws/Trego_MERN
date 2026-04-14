import express from "express";
import { createProjectController } from "./project.controller.js";
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

export default router;
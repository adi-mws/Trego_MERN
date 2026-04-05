import { Router } from "express"
import { getUserGlobalData, updatePreferences, updateProfile } from "./user.controller.js";
import ensureAuth from "../../middlewares/ensureAuth.js"
import { createUploader } from "../../middlewares/multer.js";
const router = Router();


const uploadAvatar = createUploader(
  "avatars",     // folder
  "single",      // mode
  "avatar",      // field name (IMPORTANT)
  1,
  ["image/jpeg", "image/png", "image/webp"],
  true,
  { width: 400, height: 400, quality: 80 }
);

router.put("/profile", uploadAvatar, updateProfile);

router.get("/global", ensureAuth, getUserGlobalData);
router.put("/preferences", ensureAuth, updatePreferences); 
export default router;

import { Router } from "express"
import { getUserGlobalData, updatePreferences, updateProfile } from "./user.controller.js";
import ensureAuth from "../../middlewares/ensureAuth.js"
const router = Router();

router.get("/global", ensureAuth, getUserGlobalData);
router.put("/preferences", ensureAuth, updatePreferences); 
router.put("/profile", ensureAuth, updateProfile);
export default router;

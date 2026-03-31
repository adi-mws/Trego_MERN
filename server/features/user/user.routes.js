import { Router } from "express"
import { getUserGlobalData } from "./user.controller.js";

const router = Router();

router.get("/user-global-state", getUserGlobalData);


export default router;

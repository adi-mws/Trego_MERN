import express from "express";
import ensureAuth from "../../middlewares/ensureAuth.js";
import { searchWorkspaceController } from "./search.controller.js";

const router = express.Router();

router.get("/workspace/:workspaceSlug", ensureAuth, searchWorkspaceController);

export default router;

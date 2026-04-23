import express from "express";
import ensureAuth from "../../middlewares/ensureAuth.js";
import {
  getProjectWorkflows,
  getWorkflow,
  createWorkflow,
  saveWorkflow,
  cloneWorkflow,
  deleteWorkflow
} from "./workflow.controller.js";

const router = express.Router();


router.get("/project/:projectId", ensureAuth, getProjectWorkflows);
router.post("/", ensureAuth, createWorkflow);

router.get("/:id", ensureAuth, getWorkflow);
router.put("/:id", ensureAuth, saveWorkflow);
router.delete("/:id", ensureAuth, deleteWorkflow);
router.post("/:id/clone", ensureAuth, cloneWorkflow);

export default router;

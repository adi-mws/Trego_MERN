import express from "express";
import ensureAuth from "../../middlewares/ensureAuth.js";
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    getTasks, createTask, updateTask, assignToCategory, removeFromCategory, switchWorkflow, deleteTask,
} from "./task.controller.js";
import {
    getTaskDetail, addComment, getProjectComments, deleteComment,
    addSubtask, toggleSubtask, deleteSubtask,
    getTaskStateHistory, getProjectStateHistory,
    getAvailableTransitions, advanceTaskStage,
} from "./taskExtra.controller.js";

const router = express.Router();

// ─── Task Categories ──────────────────────────────────────────────────────────
router.get("/project/:projectId/categories", ensureAuth, getCategories);
router.post("/project/:projectId/categories", ensureAuth, createCategory);
router.put("/categories/:categoryId", ensureAuth, updateCategory);
router.delete("/categories/:categoryId", ensureAuth, deleteCategory);

// ─── Project-level aggregations ───────────────────────────────────────────────
router.get("/project/:projectId", ensureAuth, getTasks);
router.post("/project/:projectId", ensureAuth, createTask);
router.get("/project/:projectId/comments", ensureAuth, getProjectComments);
router.get("/project/:projectId/state-history", ensureAuth, getProjectStateHistory);

// ─── Single Task ──────────────────────────────────────────────────────────────
router.get("/:taskId/detail", ensureAuth, getTaskDetail);
router.put("/:taskId", ensureAuth, updateTask);
router.delete("/:taskId", ensureAuth, deleteTask);

// ─── Task Category / Workflow ops ─────────────────────────────────────────────
router.post("/:taskId/assign-category", ensureAuth, assignToCategory);
router.post("/:taskId/remove-category", ensureAuth, removeFromCategory);
router.post("/:taskId/switch-workflow", ensureAuth, switchWorkflow);

// ─── Comments ─────────────────────────────────────────────────────────────────
router.post("/:taskId/comments", ensureAuth, addComment);
router.delete("/comments/:commentId", ensureAuth, deleteComment);

// ─── Subtasks (TaskObjective) ─────────────────────────────────────────────────
router.post("/:taskId/subtasks", ensureAuth, addSubtask);
router.patch("/subtasks/:subtaskId/toggle", ensureAuth, toggleSubtask);
router.delete("/subtasks/:subtaskId", ensureAuth, deleteSubtask);

// ─── State History ────────────────────────────────────────────────────────────
router.get("/:taskId/state-history", ensureAuth, getTaskStateHistory);

// ─── Transitions (next stage) ────────────────────────────────────────────────────
router.get("/:taskId/transitions", ensureAuth, getAvailableTransitions);
router.post("/:taskId/advance", ensureAuth, advanceTaskStage);

export default router;

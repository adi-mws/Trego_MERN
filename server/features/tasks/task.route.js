import express from "express";
import ensureAuth from "../../middlewares/ensureAuth.js";
import {
    getCategories, createCategory, updateCategory, deleteCategory,
    getTasks, createTask, updateTask, assignToCategory, removeFromCategory, switchWorkflow, deleteTask,
    updateTaskAssignees,
} from "./task.controller.js";
import {
    getTaskDetail, addComment, getProjectComments, deleteComment,
    addSubtask, toggleSubtask, deleteSubtask,
    getTaskStateHistory, getProjectStateHistory,
    getAvailableTransitions, advanceTaskStage,
    getTaskStageAssignees, addStageAssignee, replaceStageAssignees, deleteStageAssignee,
} from "./taskExtra.controller.js";

const router = express.Router();

router.get("/project/:projectId/categories", ensureAuth, getCategories);
router.post("/project/:projectId/categories", ensureAuth, createCategory);
router.put("/categories/:categoryId", ensureAuth, updateCategory);
router.delete("/categories/:categoryId", ensureAuth, deleteCategory);

router.get("/project/:projectId", ensureAuth, getTasks);
router.post("/project/:projectId", ensureAuth, createTask);
router.get("/project/:projectId/comments", ensureAuth, getProjectComments);
router.get("/project/:projectId/state-history", ensureAuth, getProjectStateHistory);

router.get("/:taskId/detail", ensureAuth, getTaskDetail);
router.get("/:taskId/stage-assignees", ensureAuth, getTaskStageAssignees);
router.put("/:taskId", ensureAuth, updateTask);
router.delete("/:taskId", ensureAuth, deleteTask);

router.patch("/:taskId/assignees", ensureAuth, updateTaskAssignees);
router.post("/:taskId/stages/:stageId/assignees", ensureAuth, addStageAssignee);
router.put("/:taskId/stages/:stageId/assignees", ensureAuth, replaceStageAssignees);
router.delete("/:taskId/stages/:stageId/assignees/:projectMemberId", ensureAuth, deleteStageAssignee);

router.post("/:taskId/assign-category", ensureAuth, assignToCategory);
router.post("/:taskId/remove-category", ensureAuth, removeFromCategory);
router.post("/:taskId/switch-workflow", ensureAuth, switchWorkflow);

router.post("/:taskId/comments", ensureAuth, addComment);
router.delete("/comments/:commentId", ensureAuth, deleteComment);

router.post("/:taskId/subtasks", ensureAuth, addSubtask);
router.patch("/subtasks/:subtaskId/toggle", ensureAuth, toggleSubtask);
router.delete("/subtasks/:subtaskId", ensureAuth, deleteSubtask);

router.get("/:taskId/state-history", ensureAuth, getTaskStateHistory);

router.get("/:taskId/transitions", ensureAuth, getAvailableTransitions);
router.post("/:taskId/advance", ensureAuth, advanceTaskStage);

export default router;

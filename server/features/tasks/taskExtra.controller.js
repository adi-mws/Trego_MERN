import * as extraService from "./taskExtra.service.js";
import { Project } from "../projects/project.model.js";
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { ProjectMember } from "../projects/projectMember.model.js";
import { Task } from "./task.model.js";
import {
  addTaskStageAssignee,
  removeTaskStageAssignee,
  replaceTaskStageAssignees,
} from "./taskStageAssignee.service.js";

const ADMIN_ROLES = ["OWNER", "ADMIN"];

async function resolveTaskContext(req, taskId) {
  const task = await Task.findById(taskId).select("projectId").lean();
  if (!task) {
    return null;
  }

  const project = await Project.findById(task.projectId).select("workspace").lean();
  if (!project) {
    return null;
  }

  const workspaceMembership = await WorkspaceMember.findOne({
    workspaceId: project.workspace,
    userId: req.user?.userId,
  }).lean();

  const workspaceRole = String(workspaceMembership?.role || "").toUpperCase();
  const projectMembership = await ProjectMember.findOne({
    project: task.projectId,
    user: req.user?.userId,
  })
    .select("_id")
    .lean();

  return {
    task,
    project,
    workspaceRole,
    workspaceMembership,
    projectMembership,
    isAdmin: ADMIN_ROLES.includes(workspaceRole),
  };
}

// ─ Task Detail ───────────────────────────────────────────────────────────────────────

// ── Task Detail ────────────────────────────────────────────────────────────────
export const getTaskDetail = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const context = await resolveTaskContext(req, taskId);
    if (!context) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const data = await extraService.getTaskDetail(taskId, {
      userId: req.user?.userId,
      workspaceRole: context.workspaceRole,
    });
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const getTaskStageAssignees = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const context = await resolveTaskContext(req, taskId);
    if (!context) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const data = await extraService.getTaskDetail(taskId, {
      userId: req.user?.userId,
      workspaceRole: context.workspaceRole,
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// ── Comments ───────────────────────────────────────────────────────────────────
export const addComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { projectId, content } = req.body;
    const userId = req.user.userId;
    const comment = await extraService.addComment({ taskId, projectId, userId, content });
    res.status(201).json({ success: true, data: comment });
  } catch (err) { next(err); }
};

export const getProjectComments = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const comments = await extraService.getProjectComments(projectId);
    res.status(200).json({ success: true, data: comments });
  } catch (err) { next(err); }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;
    await extraService.deleteComment(commentId, userId);
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
};

// ── Subtasks ───────────────────────────────────────────────────────────────────
export const addSubtask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { workflowStageId, title, description } = req.body;
    const userId = req.user.userId;
    const subtask = await extraService.addSubtask({ taskId, workflowStageId, title, description, userId });
    res.status(201).json({ success: true, data: subtask });
  } catch (err) { next(err); }
};

export const toggleSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    const userId = req.user.userId;
    const subtask = await extraService.toggleSubtask(subtaskId, userId);
    res.status(200).json({ success: true, data: subtask });
  } catch (err) { next(err); }
};

export const deleteSubtask = async (req, res, next) => {
  try {
    const { subtaskId } = req.params;
    await extraService.deleteSubtask(subtaskId);
    res.status(200).json({ success: true });
  } catch (err) { next(err); }
};

// ── State History ──────────────────────────────────────────────────────────────
export const getTaskStateHistory = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const data = await extraService.getTaskStateHistory(taskId);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const getProjectStateHistory = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const data = await extraService.getProjectStateHistory(projectId);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

// ─ Transitions ──────────────────────────────────────────────────────────────────────
export const getAvailableTransitions = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const data = await extraService.getAvailableTransitions(taskId);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
};

export const advanceTaskStage = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { transitionId, comment } = req.body;
    const userId = req.user.userId;
    const result = await extraService.advanceTaskStage({
      taskId,
      transitionId,
      userId,
      comment,
    });
    res.status(200).json({ success: true, data: result });
  } catch (err) { next(err); }
};

export const addStageAssignee = async (req, res, next) => {
  try {
    const { taskId, stageId } = req.params;
    const { projectMemberId } = req.body;
    const context = await resolveTaskContext(req, taskId);
    if (!context) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!context.isAdmin) {
      return res.status(403).json({ success: false, message: "Only admins can manage stage assignees" });
    }

    const data = await addTaskStageAssignee({
      taskId,
      stageId,
      projectMemberId,
      assignedBy: req.user.userId,
      sourceSessionId: req.user?.sessionId || null,
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const replaceStageAssignees = async (req, res, next) => {
  try {
    const { taskId, stageId } = req.params;
    const { projectMemberIds = [] } = req.body;
    const context = await resolveTaskContext(req, taskId);
    if (!context) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!context.isAdmin) {
      return res.status(403).json({ success: false, message: "Only admins can manage stage assignees" });
    }

    const data = await replaceTaskStageAssignees({
      taskId,
      stageId,
      projectMemberIds,
      assignedBy: req.user.userId,
      sourceSessionId: req.user?.sessionId || null,
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const deleteStageAssignee = async (req, res, next) => {
  try {
    const { taskId, stageId, projectMemberId } = req.params;
    const context = await resolveTaskContext(req, taskId);
    if (!context) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    if (!context.isAdmin) {
      return res.status(403).json({ success: false, message: "Only admins can manage stage assignees" });
    }

    const data = await removeTaskStageAssignee({ taskId, stageId, projectMemberId });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

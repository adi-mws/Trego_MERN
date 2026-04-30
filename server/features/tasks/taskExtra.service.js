import mongoose from "mongoose";
import { Task } from "./task.model.js";
import { TaskComment } from "./taskComment.model.js";
import { TaskStateHistory } from "./taskStateHistory.model.js";
import { TaskObjective } from "./taskObjective.model.js";
import { WorkflowStage } from "../workflows/workflowStage.model.js";
import { WorkflowTransition } from "../workflows/workflowTransition.model.js";
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { Project } from "../projects/project.model.js";
import { ProjectMember } from "../projects/projectMember.model.js";
import TaskCategory from "./taskCategory.model.js";
import {
  canUserViewTaskByStageAssignments,
  getTaskStageAssignmentBundle,
} from "./taskStageAssignee.service.js";
import { TaskStageAssignee } from "./taskStageAssignee.model.js";
import { Workspace } from "../workspaces/workspace.model.js";
import { createTaskStageAdvancedNotification } from "../notifications/notification.service.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET FULL TASK DETAIL (for TaskView page)
// ─────────────────────────────────────────────────────────────────────────────
export const getTaskDetail = async (taskId, { userId, workspaceRole } = {}) => {
  const canView = await canUserViewTaskByStageAssignments({ taskId, userId, workspaceRole });
  if (!canView) throw new Error("Task not found");

  const [taskBundle, comments, stateHistory, subtasks] = await Promise.all([
    getTaskStageAssignmentBundle(taskId),
    TaskComment.find({ taskId, type: "COMMENT" })
      .populate("user", "name email avatar")
      .sort({ createdAt: 1 })
      .lean(),
    TaskStateHistory.find({ taskId })
      .populate("fromStage", "name isStart isEnd")
      .populate("toStage", "name isStart isEnd")
      .populate("triggeredBy", "name email avatar")
      .sort({ enteredAt: 1 })
      .lean(),
    TaskObjective.find({ taskId })
      .populate("completedBy", "name email avatar")
      .sort({ position: 1, createdAt: 1 })
      .lean(),
  ]);

  const { task, workflowStages, stageAssignments, eligibleMembersByStage } = taskBundle;
  const workflowTransitions = task.workflowId
    ? await WorkflowTransition.find({ workflowId: task.workflowId._id || task.workflowId })
      .populate("fromStage", "name isStart isEnd allowedRoles order")
      .populate("toStage", "name isStart isEnd allowedRoles order")
      .populate("allowedRoles", "name color")
      .sort({ createdAt: 1 })
      .lean()
    : [];

  // Compute allowedRoles from current stage + outgoing transitions
  let allowedRoles = [];
  if (task.currentStageId) {
    const transitions = await WorkflowTransition.find({ fromStage: task.currentStageId._id || task.currentStageId })
      .populate("allowedRoles", "name color")
      .lean();
    const stageRoles = (task.currentStageId.allowedRoles || []);
    const transRoles = transitions.flatMap(t => t.allowedRoles || []);
    // Deduplicate by _id
    const roleMap = new Map();
    [...stageRoles, ...transRoles].forEach(r => { if (r?._id) roleMap.set(String(r._id), r); });
    allowedRoles = [...roleMap.values()];
  }

  return {
    task,
    comments,
    stateHistory,
    subtasks,
    allowedRoles,
    workflowStages,
    workflowTransitions,
    stageAssignments,
    eligibleMembersByStage,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────────────────────
export const addComment = async ({ taskId, projectId, userId, content }) => {
  const comment = new TaskComment({ taskId, projectId, user: userId, content, type: "COMMENT" });
  await comment.save();
  await comment.populate("user", "name email avatar");
  return comment;
};

export const getProjectComments = async (projectId) => {
  return TaskComment.find({ projectId, type: "COMMENT" })
    .populate("user", "name email avatar")
    .populate({ path: "taskId", select: "title categoryId", populate: { path: "categoryId", select: "name color" } })
    .sort({ createdAt: -1 })
    .lean();
};

export const deleteComment = async (commentId, userId) => {
  const comment = await TaskComment.findById(commentId);
  if (!comment) throw new Error("Comment not found");
  if (String(comment.user) !== String(userId)) throw new Error("Not authorized to delete this comment");
  await TaskComment.findByIdAndDelete(commentId);
  return { success: true };
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBTASKS (TaskObjective)
// ─────────────────────────────────────────────────────────────────────────────
export const addSubtask = async ({ taskId, workflowStageId, title, description, userId }) => {
  const task = await Task.findById(taskId).select("workflowId").lean();
  if (!task) {
    throw new Error("Task not found");
  }

  if (!task.workflowId) {
    throw new Error("Attach a workflow before creating subtasks");
  }

  const count = await TaskObjective.countDocuments({ taskId, workflowStageId });
  const subtask = new TaskObjective({
    taskId,
    workflowStageId: workflowStageId || null,
    title,
    description,
    position: count,
  });
  await subtask.save();
  return subtask;
};

export const toggleSubtask = async (subtaskId, userId) => {
  const subtask = await TaskObjective.findById(subtaskId);
  if (!subtask) throw new Error("Subtask not found");
  subtask.isCompleted = !subtask.isCompleted;
  subtask.completedAt = subtask.isCompleted ? new Date() : null;
  subtask.completedBy = subtask.isCompleted ? userId : null;
  await subtask.save();
  return subtask;
};

export const deleteSubtask = async (subtaskId) => {
  await TaskObjective.findByIdAndDelete(subtaskId);
  return { success: true };
};

// ─────────────────────────────────────────────────────────────────────────────
// STATE HISTORY
// ─────────────────────────────────────────────────────────────────────────────
export const getTaskStateHistory = async (taskId) => {
  return TaskStateHistory.find({ taskId })
    .populate("fromStage", "name isStart isEnd")
    .populate("toStage", "name isStart isEnd")
    .populate("triggeredBy", "name email avatar")
    .sort({ enteredAt: 1 })
    .lean();
};

export const getProjectStateHistory = async (projectId) => {
  return TaskStateHistory.find({ projectId })
    .populate("taskId", "title categoryId")
    .populate("fromStage", "name isStart isEnd")
    .populate("toStage", "name isStart isEnd")
    .populate("triggeredBy", "name email avatar")
    .sort({ createdAt: -1 })
    .lean();
};

// Record a transition (called internally when task stage changes)
export const recordTransition = async ({ taskId, projectId, fromStageId, toStageId, transitionId, userId, comment }) => {
  // Mark current open record as exited
  await TaskStateHistory.findOneAndUpdate(
    { taskId, exitedAt: null },
    { exitedAt: new Date() }
  );

  const record = new TaskStateHistory({
    taskId,
    projectId,
    fromStage: fromStageId || null,
    toStage: toStageId,
    transitionId: transitionId || null,
    triggeredBy: userId,
    comment,
    enteredAt: new Date(),
  });
  await record.save();

  // Also log a TRANSITION comment
  await new TaskComment({
    taskId,
    projectId,
    user: userId,
    content: comment || "Stage advanced",
    type: "TRANSITION",
    references: { fromStage: fromStageId, toStage: toStageId, transition: transitionId },
  }).save();

  return record;
};

// ─────────────────────────────────────────────────────────────────────────────
// TRANSITIONS — available next steps from current stage
// ─────────────────────────────────────────────────────────────────────────────
export const getAvailableTransitions = async (taskId) => {
  const { WorkflowTransition } = await import("../workflows/workflowTransition.model.js");
  const task = await Task.findById(taskId).lean();
  if (!task) throw new Error("Task not found");
  if (!task.currentStageId) return [];

  const transitions = await WorkflowTransition.find({ fromStage: task.currentStageId })
    .populate("toStage", "name isEnd isStart")
    .populate("allowedRoles", "name color")
    .lean();

  return transitions;
};

// Advance task to a new stage via a specific transition (admin/owner bypass OR role check)
export const advanceTaskStage = async ({ taskId, transitionId, userId, comment, sourceSessionId = null }) => {
  const { WorkflowTransition } = await import("../workflows/workflowTransition.model.js");
  const task = await Task.findById(taskId).select("projectId currentStageId workflowId title").lean();
  if (!task) throw new Error("Task not found");

  const transition = await WorkflowTransition.findById(transitionId)
    .populate("allowedRoles", "_id name")
    .populate("toStage", "name isEnd")
    .lean();
  if (!transition) throw new Error("Transition not found");
  if (String(transition.fromStage) !== String(task.currentStageId)) {
    throw new Error("Transition does not match current stage");
  }

  const project = await Project.findById(task.projectId).select("workspace").lean();
  if (!project) throw new Error("Project not found");

  const workspaceMember = await WorkspaceMember.findOne({
    workspaceId: project.workspace,
    userId,
  }).lean();

  const isAdminOrOwner = ["ADMIN", "OWNER"].includes(String(workspaceMember?.role || "").toUpperCase());
  const transitionComment = String(comment || "").trim();

  const projectMember = await ProjectMember.findOne({
    project: task.projectId,
    user: userId,
  })
    .populate("roles", "_id name")
    .lean();

  if (!isAdminOrOwner && !projectMember) {
    throw new Error("Only project members can advance this task");
  }

  if (!isAdminOrOwner) {
    const allowedIds = (transition.allowedRoles || []).map((r) => String(r._id));
    const userIds = (projectMember?.roles || []).map((r) => String(r._id || r.id || r));
    const canProceed = allowedIds.length === 0 || userIds.some((id) => allowedIds.includes(id));
    if (!canProceed) throw new Error("You do not have the required role for this transition");
  }

  if (transition.requireComment && !transitionComment) {
    throw new Error("A comment is required before this transition can be applied");
  }

  // Block advancement from the start stage if startDate hasn't arrived yet.
  const fullTask = await Task.findById(taskId).select("startDate workflowId currentStageId").lean();
  if (fullTask?.startDate && fullTask?.workflowId) {
    const startStage = await WorkflowStage.findOne({ workflowId: fullTask.workflowId, isStart: true }).lean();
    const isOnStartStage = startStage && String(fullTask.currentStageId) === String(startStage._id);
    if (isOnStartStage && new Date(fullTask.startDate) > new Date()) {
      const startStr = new Date(fullTask.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      throw new Error(`Task is scheduled to start on ${startStr} and cannot be advanced before then.`);
    }
  }

  // Perform stage update
  const oldStageId = task.currentStageId;
  await Task.findByIdAndUpdate(taskId, { currentStageId: transition.toStage._id });

  // Record history
  const projectId = task.projectId;
  const historyRecord = await recordTransition({
    taskId,
    projectId,
    fromStageId: oldStageId,
    toStageId: transition.toStage._id,
    transitionId,
    userId,
    comment: transitionComment || transition.action || `Moved to ${transition.toStage.name}`,
  });

  try {
    const [notificationProject, workspace, fromStage] = await Promise.all([
      Project.findById(task.projectId).select("_id name slug workspace").lean(),
      Workspace.findById(project.workspace).select("_id name slug").lean(),
      oldStageId ? WorkflowStage.findById(oldStageId).select("_id name").lean() : null,
    ]);

    if (notificationProject && workspace) {
      await createTaskStageAdvancedNotification({
        task,
        project: notificationProject,
        workspace,
        fromStage,
        toStage: transition.toStage,
        userId,
        sourceSessionId,
      });
    }
  } catch (notificationError) {
    console.warn("Failed to send task stage advanced notification:", notificationError?.message || notificationError);
  }

  return { success: true, newStage: transition.toStage, historyRecord };
};


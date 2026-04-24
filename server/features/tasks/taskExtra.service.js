import mongoose from "mongoose";
import { Task } from "./task.model.js";
import { TaskComment } from "./taskComment.model.js";
import { TaskStateHistory } from "./taskStateHistory.model.js";
import { TaskObjective } from "./taskObjective.model.js";
import { WorkflowStage } from "../workflows/workflowStage.model.js";
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { Project } from "../projects/project.model.js";
import { ProjectMember } from "../projects/projectMember.model.js";
import TaskCategory from "./taskCategory.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// GET FULL TASK DETAIL (for TaskView page)
// ─────────────────────────────────────────────────────────────────────────────
export const getTaskDetail = async (taskId) => {
  const [task, comments, stateHistory, subtasks] = await Promise.all([
    Task.findById(taskId)
      .populate("categoryId", "name color")
      .populate("workflowId", "name version")
      .populate("currentStageId", "name isStart isEnd allowedRoles")
      .populate("createdBy", "name email avatar")
      .populate("assignees", "name email avatar")
      .lean(),
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

  if (!task) throw new Error("Task not found");

  // Compute allowedRoles from current stage + outgoing transitions
  let allowedRoles = [];
  if (task.currentStageId) {
    const { WorkflowTransition } = await import("../workflows/workflowTransition.model.js");
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

  return { task, comments, stateHistory, subtasks, allowedRoles };
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
export const advanceTaskStage = async ({ taskId, transitionId, userId, comment }) => {
  const { WorkflowTransition } = await import("../workflows/workflowTransition.model.js");
  const task = await Task.findById(taskId).select("projectId currentStageId").lean();
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

  const projectMember = await ProjectMember.findOne({
    project: task.projectId,
    user: userId,
  })
    .populate("roles", "_id name")
    .lean();

  const isAdminOrOwner = ["ADMIN", "OWNER"].includes(String(workspaceMember?.role || "").toUpperCase());
  if (!isAdminOrOwner) {
    // Check projectRole overlap with transition allowedRoles
    const allowedIds = (transition.allowedRoles || []).map(r => String(r._id));
    const userIds = (projectMember?.roles || []).map(r => String(r._id || r.id || r));
    const canProceed = allowedIds.length === 0 || userIds.some(id => allowedIds.includes(id));
    if (!canProceed) throw new Error("You do not have the required role for this transition");
  }

  // Perform stage update
  const oldStageId = task.currentStageId;
  await Task.findByIdAndUpdate(taskId, { currentStageId: transition.toStage._id });

  // Record history
  const projectId = task.projectId;
  await recordTransition({
    taskId,
    projectId,
    fromStageId: oldStageId,
    toStageId: transition.toStage._id,
    transitionId,
    userId,
    comment: comment || transition.action || `Moved to ${transition.toStage.name}`,
  });

  return { success: true, newStage: transition.toStage };
};

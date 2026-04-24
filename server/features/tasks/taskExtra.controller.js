import * as extraService from "./taskExtra.service.js";

// ─ Task Detail ───────────────────────────────────────────────────────────────────────

// ── Task Detail ────────────────────────────────────────────────────────────────
export const getTaskDetail = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const data = await extraService.getTaskDetail(taskId);
    res.status(200).json({ success: true, data });
  } catch (err) { next(err); }
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

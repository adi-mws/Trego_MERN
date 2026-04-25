import * as taskService from "./task.service.js";
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { Project } from "../projects/project.model.js";
import { ProjectMember } from "../projects/projectMember.model.js";
import { replaceTaskStageAssignees } from "./taskStageAssignee.service.js";
import * as extraService from "./taskExtra.service.js";

const ADMIN_ROLES = ["OWNER", "ADMIN"];

// Helper: resolve workspaceId + membership from projectId
async function resolveRbacContext(req, projectId) {
    const userId = req.user?.userId;
    const project = await Project.findById(projectId).select("workspace").lean();
    if (!project) return { isAdmin: false, userId, workspaceRole: null, workspaceMembership: null, projectMembership: null };

    const workspaceMembership = await WorkspaceMember.findOne({
        workspaceId: project.workspace,
        userId,
    }).lean();

    const workspaceRole = String(workspaceMembership?.role || "").toUpperCase();
    const isAdmin = ADMIN_ROLES.includes(workspaceRole);
    const projectMembership = isAdmin
        ? null
        : await ProjectMember.findOne({
            project: projectId,
            user: userId,
        })
            .populate("roles", "name color")
            .lean();

    return {
        isAdmin,
        userId,
        workspaceId: project.workspace,
        workspaceRole,
        workspaceMembership,
        projectMembership,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// TASK CATEGORY CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

export const getCategories = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const categories = await taskService.getAllTaskCategories({ projectId });
        res.status(200).json({ success: true, data: categories });
    } catch (err) {
        next(err);
    }
};

export const createCategory = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { name, description, color, defaultWorkflowId } = req.body;
        const category = await taskService.createTaskCategory({ projectId, name, description, color, defaultWorkflowId });
        res.status(201).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};

export const updateCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const updates = req.body;
        const category = await taskService.updateTaskCategory(categoryId, updates);
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        next(err);
    }
};

export const deleteCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        await taskService.deleteTaskCategory(categoryId);
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// TASK CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

export const getTasks = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const { search } = req.query;

        const { isAdmin, workspaceRole, projectMembership } = await resolveRbacContext(req, projectId);
        const visibility = isAdmin
            ? { scope: "all" }
            : workspaceRole === "MEMBER" && projectMembership
                ? { scope: "member", projectMemberId: projectMembership._id }
                : { scope: "none" };

        const tasks = visibility.scope === "none"
            ? []
            : await taskService.getTasksByProject(projectId, search, visibility);
        res.status(200).json({ success: true, data: tasks, isAdmin });
    } catch (err) {
        next(err);
    }
};

export const createTask = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const createdBy = req.user.userId;
        const { title, description, categoryId, workflowId, priority, deadline, startDate, endDate } = req.body;

        const task = await taskService.createTask({
            projectId, title, description, createdBy,
            categoryId, workflowId, priority, deadline, startDate, endDate,
        });

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;
        const task = await taskService.updateTask(taskId, updates);
        const context = await resolveRbacContext(req, task.projectId);
        try {
            const data = await extraService.getTaskDetail(taskId, {
                userId: req.user?.userId,
                workspaceRole: context.workspaceRole,
            });
            res.status(200).json({ success: true, data });
        } catch (detailErr) {
            res.status(200).json({ success: true, data: { task } });
        }
    } catch (err) {
        next(err);
    }
};

export const assignToCategory = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { categoryId } = req.body;
        const task = await taskService.assignTaskToCategory(taskId, categoryId);
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

export const removeFromCategory = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const task = await taskService.removeTaskFromCategory(taskId);
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

export const switchWorkflow = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { workflowId } = req.body;
        const task = await taskService.switchTaskWorkflow(taskId, workflowId);
        res.status(200).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

export const deleteTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        await taskService.deleteTask(taskId);
        res.status(200).json({ success: true, message: "Task deleted" });
    } catch (err) {
        next(err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// TASK ASSIGNEE MANAGEMENT (Admin only)
// ─────────────────────────────────────────────────────────────────────────────

export const updateTaskAssignees = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const { assignees, projectMemberIds } = req.body;

        // Find task to get projectId
        const { Task } = await import("./task.model.js");
        const task = await Task.findById(taskId).select("projectId currentStageId").lean();
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        // RBAC: only admins can assign
        const { isAdmin } = await resolveRbacContext(req, task.projectId);
        if (!isAdmin) {
            return res.status(403).json({ success: false, message: "Only admins can assign task members" });
        }

        const rawIds = Array.isArray(projectMemberIds)
            ? projectMemberIds
            : Array.isArray(assignees)
                ? assignees
                : [];

        const memberDocs = await ProjectMember.find({
            project: task.projectId,
            $or: [
                { _id: { $in: rawIds } },
                { user: { $in: rawIds } },
            ],
        }).lean();

        const validatedProjectMemberIds = memberDocs.map((m) => m._id);

        if (!task.currentStageId) {
            return res.status(400).json({ success: false, message: "Task is not attached to a workflow stage" });
        }

        const updated = await replaceTaskStageAssignees({
            taskId,
            stageId: task.currentStageId,
            projectMemberIds: validatedProjectMemberIds,
            assignedBy: req.user.userId,
        });
        res.status(200).json({ success: true, data: updated });
    } catch (err) {
        next(err);
    }
};

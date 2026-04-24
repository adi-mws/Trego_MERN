import * as taskService from "./task.service.js";

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
        const tasks = await taskService.getTasksByProject(projectId);
        res.status(200).json({ success: true, data: tasks });
    } catch (err) {
        next(err);
    }
};

export const createTask = async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const createdBy = req.user.userId;
        const { title, description, categoryId, workflowId, priority, deadline, assignees } = req.body;

        const task = await taskService.createTask({
            projectId, title, description, createdBy,
            categoryId, workflowId, priority, deadline, assignees,
        });

        res.status(201).json({ success: true, data: task });
    } catch (err) {
        next(err);
    }
};

export const updateTask = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const task = await taskService.updateTask(taskId, req.body);
        res.status(200).json({ success: true, data: task });
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

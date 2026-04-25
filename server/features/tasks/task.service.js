import mongoose from "mongoose";
import TaskCategory from "./taskCategory.model.js";
import { Task } from "./task.model.js";
import { WorkflowTemplate } from "../workflows/workflowTemplate.model.js";
import { WorkflowStage } from "../workflows/workflowStage.model.js";
import { TaskStageAssignee } from "./taskStageAssignee.model.js";

// ─────────────────────────────────────────────────────────────────────────────
// TASK CATEGORY SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export const getAllTaskCategories = async ({ projectId }) => {
    if (!projectId) throw new Error("Project ID is required");

    const categories = await TaskCategory.aggregate([
        {
            $match: {
                projectId: new mongoose.Types.ObjectId(projectId),
            },
        },

        // Join workflow to get name + version
        {
            $lookup: {
                from: "workflowtemplates",
                localField: "defaultWorkflowId",
                foreignField: "_id",
                as: "workflow",
            },
        },

        {
            $addFields: {
                defaultWorkflow: {
                    $cond: {
                        if: { $gt: [{ $size: "$workflow" }, 0] },
                        then: {
                            _id: { $arrayElemAt: ["$workflow._id", 0] },
                            name: { $arrayElemAt: ["$workflow.name", 0] },
                            version: { $arrayElemAt: ["$workflow.version", 0] },
                        },
                        else: null,
                    },
                },
            },
        },

        // Task count per category
        {
            $lookup: {
                from: "tasks",
                let: { categoryId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: { $eq: ["$categoryId", "$$categoryId"] },
                        },
                    },
                    { $count: "count" },
                ],
                as: "taskStats",
            },
        },

        {
            $addFields: {
                taskCount: {
                    $ifNull: [{ $arrayElemAt: ["$taskStats.count", 0] }, 0],
                },
            },
        },

        {
            $project: {
                workflow: 0,
                taskStats: 0,
            },
        },

        { $sort: { name: 1 } },
    ]);

    return categories;
};

export const createTaskCategory = async ({ projectId, name, description, color, defaultWorkflowId }) => {
    if (!projectId || !name) throw new Error("projectId and name are required");

    const category = new TaskCategory({
        projectId,
        name,
        description: description || "",
        color: color || "#1890ff",
        defaultWorkflowId: defaultWorkflowId || null,
    });

    await category.save();
    return category;
};

export const updateTaskCategory = async (categoryId, { name, description, color, defaultWorkflowId }) => {
    const category = await TaskCategory.findById(categoryId);
    if (!category) throw new Error("Category not found");

    // Guard: defaultWorkflow cannot be changed if there are tasks inside
    // that are NOT on their workflow's start stage.
    if (defaultWorkflowId !== undefined && String(defaultWorkflowId) !== String(category.defaultWorkflowId)) {
        // Check if any tasks in this category are on a non-start stage
        const tasksInCategory = await Task.find({ categoryId, workflowId: { $ne: null } }).lean();

        if (tasksInCategory.length > 0) {
            // Get the start stage of any active workflow assigned to these tasks
            for (const task of tasksInCategory) {
                const startStage = await WorkflowStage.findOne({ workflowId: task.workflowId, isStart: true }).lean();
                if (startStage && String(task.currentStageId) !== String(startStage._id)) {
                    throw new Error(
                        "Cannot change default workflow — one or more tasks in this category are not on the start stage of their workflow."
                    );
                }
            }
        }
    }

    if (name !== undefined) category.name = name;
    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    if (defaultWorkflowId !== undefined) category.defaultWorkflowId = defaultWorkflowId || null;

    await category.save();
    return category;
};

export const deleteTaskCategory = async (categoryId) => {
    const category = await TaskCategory.findById(categoryId);
    if (!category) throw new Error("Category not found");

    // Prevent deletion if there are tasks still in this category
    const taskCount = await Task.countDocuments({ categoryId });
    if (taskCount > 0) {
        throw new Error(`Cannot delete category — ${taskCount} task(s) are still in this category. Uncategorize them first.`);
    }

    await TaskCategory.findByIdAndDelete(categoryId);
    return { success: true };
};

// ─────────────────────────────────────────────────────────────────────────────
// TASK SERVICES
// ─────────────────────────────────────────────────────────────────────────────

export const getTasksByProject = async (projectId, search, visibility = { scope: "all" }) => {
    if (!projectId) throw new Error("Project ID is required");

    const searchTerm = String(search || "").trim();
    const searchMatch = searchTerm
        ? {
            $or: [
                { title: { $regex: searchTerm, $options: "i" } },
                { description: { $regex: searchTerm, $options: "i" } },
            ],
        }
        : null;

    const visibilityScope = String(visibility?.scope || "all").toLowerCase();
    const projectMemberId = visibility?.projectMemberId ? new mongoose.Types.ObjectId(visibility.projectMemberId) : null;

    const pipeline = [
        {
            $match: {
                projectId: new mongoose.Types.ObjectId(projectId),
                ...(searchMatch || {}),
            },
        },
        // Inherit color from category
        {
            $lookup: {
                from: "taskcategories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
            },
        },
        {
            $addFields: {
                category: { $arrayElemAt: ["$category", 0] },
                color: { $ifNull: [{ $arrayElemAt: ["$category.color", 0] }, null] },
            },
        },
        // Join current stage (for name + its allowedRoles)
        {
            $lookup: {
                from: "workflowstages",
                localField: "currentStageId",
                foreignField: "_id",
                as: "currentStage",
            },
        },
        {
            $addFields: {
                currentStage: { $arrayElemAt: ["$currentStage", 0] },
            },
        },
        // Join outgoing transitions from currentStage to get their allowedRoles
        {
            $lookup: {
                from: "workflowtransitions",
                localField: "currentStageId",
                foreignField: "fromStage",
                as: "outgoingTransitions",
            },
        },
        // Compute allowedRoles = union(stage.allowedRoles, all transition.allowedRoles)
        {
            $addFields: {
                allowedRoles: {
                    $setUnion: [
                        { $ifNull: ["$currentStage.allowedRoles", []] },
                        {
                            $reduce: {
                                input: "$outgoingTransitions",
                                initialValue: [],
                                in: { $setUnion: ["$$value", { $ifNull: ["$$this.allowedRoles", []] }] },
                            },
                        },
                    ],
                },
            },
        },
        {
            $project: { outgoingTransitions: 0 },
        },
        { $sort: { createdAt: -1 } },
    ];

    if (visibilityScope === "member" && projectMemberId) {
        pipeline.push(
            {
                $lookup: {
                    from: "taskstageassignees",
                    let: { taskId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$taskId", "$$taskId"] },
                                        { $eq: ["$projectMemberId", projectMemberId] },
                                    ],
                                },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: "visibilityAssignments",
                },
            },
            {
                $match: {
                    $expr: { $gt: [{ $size: "$visibilityAssignments" }, 0] },
                },
            },
            {
                $project: { visibilityAssignments: 0 },
            }
        );
    }

    const tasks = await Task.aggregate(pipeline);

    return tasks;
};

export const createTask = async ({ projectId, title, description, createdBy, categoryId, workflowId, priority, deadline, startDate, endDate }) => {
    if (!projectId || !title || !createdBy) throw new Error("projectId, title, and createdBy are required");

    let resolvedWorkflowId = workflowId || null;
    let currentStageId = null;

    if (categoryId && !resolvedWorkflowId) {
        const category = await TaskCategory.findById(categoryId).lean();
        if (category?.defaultWorkflowId) resolvedWorkflowId = category.defaultWorkflowId;
    }

    if (resolvedWorkflowId) {
        const startStage = await WorkflowStage.findOne({ workflowId: resolvedWorkflowId, isStart: true }).lean();
        if (startStage) currentStageId = startStage._id;
    }

    const task = new Task({
        projectId,
        title,
        description,
        createdBy,
        categoryId: categoryId || null,
        workflowId: resolvedWorkflowId,
        currentStageId,
        priority,
        deadline: deadline || null,
        startDate: startDate || null,
        endDate: endDate || null,
    });

    await task.save();
    return task;
};

export const updateTask = async (taskId, updates) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    const allowedFields = ["title", "description", "priority", "deadline", "startDate", "endDate", "isBlocked", "blockedReason", "dependencies", "categoryId"];
    allowedFields.forEach(field => {
        if (updates[field] !== undefined) task[field] = updates[field];
    });

    if (Object.prototype.hasOwnProperty.call(updates, "workflowId")) {
        const nextWorkflowId = updates.workflowId || null;
        const currentWorkflowId = task.workflowId ? String(task.workflowId) : null;
        const desiredWorkflowId = nextWorkflowId ? String(nextWorkflowId) : null;

        if (currentWorkflowId !== desiredWorkflowId) {
            const hasStageAssignees = await TaskStageAssignee.exists({ taskId });

            let currentStageIsStart = true;
            if (task.currentStageId) {
                const currentStage = await WorkflowStage.findById(task.currentStageId).lean();
                currentStageIsStart = Boolean(currentStage?.isStart);
            }

            if (hasStageAssignees && !currentStageIsStart) {
                throw new Error("Cannot switch workflow while the task is already in progress.");
            }

            await TaskStageAssignee.deleteMany({ taskId });

            task.workflowId = desiredWorkflowId;
            if (desiredWorkflowId) {
                const startStage = await WorkflowStage.findOne({ workflowId: desiredWorkflowId, isStart: true }).lean();
                task.currentStageId = startStage?._id || null;
            } else {
                task.currentStageId = null;
            }
        }
    }

    await task.save();
    return task;
};

export const assignTaskToCategory = async (taskId, categoryId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    task.categoryId = categoryId || null;
    await task.save();
    return task;
};

export const removeTaskFromCategory = async (taskId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    task.categoryId = null;
    await task.save();
    return task;
};

export const switchTaskWorkflow = async (taskId, newWorkflowId) => {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    // If the task is already on a workflow and is NOT on the start stage, block switching
    if (task.workflowId && task.currentStageId) {
        const startStage = await WorkflowStage.findOne({ workflowId: task.workflowId, isStart: true }).lean();
        if (startStage && String(task.currentStageId) !== String(startStage._id)) {
            throw new Error("Cannot switch workflow — task is already in progress (not on start stage).");
        }
    }

    // Set to new workflow start stage
    let newStageId = null;
    if (newWorkflowId) {
        const startStage = await WorkflowStage.findOne({ workflowId: newWorkflowId, isStart: true }).lean();
        if (startStage) newStageId = startStage._id;
    }

    task.workflowId = newWorkflowId || null;
    task.currentStageId = newStageId;
    await task.save();
    return task;
};

export const deleteTask = async (taskId) => {
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) throw new Error("Task not found");
    return { success: true };
};

// Project Metrics endpoint — aggregates tasks, categories, workflows, members
import mongoose from "mongoose";
import { Task } from "../tasks/task.model.js";
import { WorkflowTemplate } from "../workflows/workflowTemplate.model.js";
import TaskCategory from "../tasks/taskCategory.model.js";
import { ProjectMember } from "./projectMember.model.js";

export const getProjectMetrics = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    // Validate ObjectId before converting
    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const pid = new mongoose.Types.ObjectId(projectId);
    const now = new Date();

    // Run all queries in parallel — no populates that clobber categoryId
    const [tasks, memberCount, categories, workflows] = await Promise.all([
      Task.find({ projectId: pid })
        .populate("currentStageId", "isEnd name")
        .lean(),
      ProjectMember.countDocuments({ project: pid }),
      TaskCategory.find({ projectId: pid }).lean(),
      WorkflowTemplate.find({ projectId: pid }).lean(),
    ]);

    // Status counts
    const total = tasks.length;
    const completed = tasks.filter(t => t.currentStageId?.isEnd).length;
    const overdue = tasks.filter(
      t => !t.currentStageId?.isEnd && t.deadline && new Date(t.deadline) < now
    ).length;
    const inProgress = total - completed - overdue;

    // Priority breakdown
    const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    tasks.forEach(t => {
      if (byPriority[t.priority] !== undefined) byPriority[t.priority]++;
    });

    // Category breakdown — categoryId is a raw ObjectId (no populate), safe to compare
    const byCategory = categories.map(cat => ({
      name: cat.name,
      color: cat.color,
      count: tasks.filter(
        t => t.categoryId && String(t.categoryId) === String(cat._id)
      ).length,
    }));
    byCategory.push({
      name: "Uncategorized",
      color: "#9e9e9e",
      count: tasks.filter(t => !t.categoryId).length,
    });

    res.status(200).json({
      success: true,
      data: {
        tasks: { total, completed, overdue, inProgress },
        members: memberCount,
        categories: categories.length,
        workflows: workflows.length,
        byPriority,
        byCategory,
      },
    });
  } catch (error) {
    next(error);
  }
};

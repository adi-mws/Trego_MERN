import mongoose from "mongoose";
import { Task } from "../tasks/task.model.js";
import { Project } from "../projects/project.model.js";
import { WorkspaceMember } from "./workspaceMember.model.js";

export const getWorkspaceMetrics = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({ success: false, message: "Invalid workspace ID" });
    }

    const wid = new mongoose.Types.ObjectId(workspaceId);
    const now = new Date();

    // 1. Get all projects in workspace
    const projects = await Project.find({ workspace: wid }).select("_id name").lean();
    const projectIds = projects.map(p => p._id);

    // 2. Aggregate tasks across all projects
    const [tasks, membersCount] = await Promise.all([
      Task.find({ projectId: { $in: projectIds } })
        .populate("currentStageId", "isEnd")
        .lean(),
      WorkspaceMember.countDocuments({ workspaceId: wid }),
    ]);

    // 3. Compute metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.currentStageId?.isEnd).length;
    const blockedTasks = tasks.filter(t => t.isBlocked).length;
    const overdueTasks = tasks.filter(
      t => !t.currentStageId?.isEnd && t.deadline && new Date(t.deadline) < now
    ).length;
    
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Simple health score logic (0-100)
    // 100 base score. -10 for every 10% blocked, -10 for every 10% overdue.
    let healthScore = 100;
    if (totalTasks > 0) {
      const blockedPenalty = (blockedTasks / totalTasks) * 100;
      const overduePenalty = (overdueTasks / totalTasks) * 100;
      healthScore = Math.max(0, Math.round(100 - blockedPenalty - overduePenalty));
    }

    let healthStatus = "HEALTHY";
    if (healthScore < 50) healthStatus = "CRITICAL";
    else if (healthScore < 80) healthStatus = "WARNING";

    const riskFlags = [];
    if (overdueTasks > totalTasks * 0.2) riskFlags.push("deadline_risk");
    if (blockedTasks > totalTasks * 0.15) riskFlags.push("high_blocked_tasks");

    res.status(200).json({
      success: true,
      data: {
        totalProjects: projects.length,
        totalMembers: membersCount,
        totalTasks,
        completedTasks,
        blockedTasks,
        overdueTasks,
        taskCompletionRate,
        overallHealthScore: healthScore,
        healthStatus,
        riskFlags,
      },
    });
  } catch (error) {
    next(error);
  }
};

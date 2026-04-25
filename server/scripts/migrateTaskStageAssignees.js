import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import { Task } from "../features/tasks/task.model.js";
import { TaskStageAssignee } from "../features/tasks/taskStageAssignee.model.js";
import { Project } from "../features/projects/project.model.js";
import { ProjectMember } from "../features/projects/projectMember.model.js";
import { WorkspaceMember } from "../features/workspaces/workspaceMember.model.js";
import { WorkflowStage } from "../features/workflows/workflowStage.model.js";

const WORKSPACE_MEMBER_ROLE = "MEMBER";

function normalizeId(value) {
  return String(value || "");
}

async function run() {
  await connectDB();

  const cursor = Task.collection.find(
    { assignees: { $exists: true, $type: "array", $ne: [] } },
    { projection: { projectId: 1, workflowId: 1, currentStageId: 1, assignees: 1 } }
  );

  let scanned = 0;
  let created = 0;
  let skipped = 0;

  while (await cursor.hasNext()) {
    const task = await cursor.next();
    scanned += 1;

    const project = await Project.findById(task.projectId).select("workspace").lean();
    if (!project) {
      skipped += 1;
      continue;
    }

    let stageId = task.currentStageId;
    if (!stageId && task.workflowId) {
      const startStage = await WorkflowStage.findOne({ workflowId: task.workflowId, isStart: true }).select("_id").lean();
      stageId = startStage?._id || null;
    }

    if (!stageId) {
      skipped += 1;
      continue;
    }

    const stage = await WorkflowStage.findById(stageId).populate("allowedRoles", "_id").lean();
    if (!stage) {
      skipped += 1;
      continue;
    }

    const assigneeIds = (task.assignees || []).map(normalizeId).filter(Boolean);
    if (assigneeIds.length === 0) {
      skipped += 1;
      continue;
    }

    const projectMembers = await ProjectMember.find({
      project: task.projectId,
      user: { $in: assigneeIds },
    })
      .populate("roles", "_id")
      .lean();

    const workspaceMembers = await WorkspaceMember.find({
      workspaceId: project.workspace,
      userId: { $in: projectMembers.map((member) => member.user) },
    })
      .select("userId role")
      .lean();

    const workspaceRoleMap = new Map(
      workspaceMembers.map((member) => [normalizeId(member.userId), String(member.role || "").toUpperCase()])
    );

    const stageRoleIds = (stage.allowedRoles || []).map((role) => normalizeId(role._id || role.id || role));
    const validMembers = projectMembers.filter((member) => {
      const workspaceRole = workspaceRoleMap.get(normalizeId(member.user));
      if (workspaceRole !== WORKSPACE_MEMBER_ROLE) return false;
      if (stageRoleIds.length === 0) return true;
      const projectRoleIds = (member.roles || []).map((role) => normalizeId(role._id || role.id || role));
      return projectRoleIds.some((roleId) => stageRoleIds.includes(roleId));
    });

    if (validMembers.length === 0) {
      skipped += 1;
      continue;
    }

    const bulkOps = validMembers.map((member) => ({
      updateOne: {
        filter: {
          taskId: task._id,
          workflowStageId: stageId,
          projectMemberId: member._id,
        },
        update: {
          $setOnInsert: {
            taskId: task._id,
            workflowStageId: stageId,
            projectMemberId: member._id,
            assignedBy: task.createdBy || member.user,
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await TaskStageAssignee.bulkWrite(bulkOps, { ordered: false });
      created += bulkOps.length;
    }
  }

  console.log(
    `Task stage assignee migration complete. scanned=${scanned} createdOrUpserted=${created} skipped=${skipped}`
  );

  process.exit(0);
}

run().catch((error) => {
  console.error("Task stage assignee migration failed:", error);
  process.exit(1);
});

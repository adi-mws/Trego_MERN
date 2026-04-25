import mongoose from "mongoose";
import { Task } from "./task.model.js";
import { Project } from "../projects/project.model.js";
import { ProjectMember } from "../projects/projectMember.model.js";
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { WorkflowStage } from "../workflows/workflowStage.model.js";
import { TaskStageAssignee } from "./taskStageAssignee.model.js";

const ADMIN_ROLES = ["OWNER", "ADMIN"];
const WORKSPACE_MEMBER_ROLE = "MEMBER";

function isAdminRole(role) {
  return ADMIN_ROLES.includes(String(role || "").toUpperCase());
}

function normalizeId(value) {
  return String(value || "");
}

function uniqueIdList(values = []) {
  return [...new Set(values.map(normalizeId).filter(Boolean))];
}

async function loadTaskScope(taskId) {
  const task = await Task.findById(taskId).select("projectId workflowId currentStageId title").lean();
  if (!task) {
    throw new Error("Task not found");
  }
  return task;
}

async function loadTaskProject(task) {
  const project = await Project.findById(task.projectId).select("workspace").lean();
  if (!project) {
    throw new Error("Project not found");
  }
  return project;
}

async function loadTaskStage(task, stageId) {
  const stage = await WorkflowStage.findById(stageId).populate("allowedRoles", "name color").lean();
  if (!stage) {
    throw new Error("Workflow stage not found");
  }

  if (!task.workflowId) {
    throw new Error("Task is not attached to a workflow");
  }

  if (normalizeId(stage.workflowId) !== normalizeId(task.workflowId)) {
    throw new Error("Workflow stage does not belong to the task workflow");
  }

  return stage;
}

async function loadProjectMember(task, projectMemberId) {
  const member = await ProjectMember.findById(projectMemberId)
    .populate("user", "name email avatar")
    .populate("roles", "name color")
    .lean();

  if (!member) {
    throw new Error("Project member not found");
  }

  if (normalizeId(member.project) !== normalizeId(task.projectId)) {
    throw new Error("Project member does not belong to the task project");
  }

  return member;
}

async function assertEligibleAssignee({ task, stage, projectMember, workspaceId }) {
  const workspaceMember = await WorkspaceMember.findOne({
    workspaceId,
    userId: projectMember.user?._id || projectMember.user,
  }).lean();

  if (!workspaceMember || String(workspaceMember.role || "").toUpperCase() !== WORKSPACE_MEMBER_ROLE) {
    throw new Error("Only workspace members with role MEMBER can be assigned to task stages");
  }

  const stageRoleIds = (stage.allowedRoles || []).map((role) => normalizeId(role._id || role.id || role));
  if (stageRoleIds.length > 0) {
    const projectRoleIds = (projectMember.roles || []).map((role) => normalizeId(role._id || role.id || role));
    const hasMatch = projectRoleIds.some((roleId) => stageRoleIds.includes(roleId));
    if (!hasMatch) {
      throw new Error("Project member does not have an allowed role for this workflow stage");
    }
  }

  return workspaceMember;
}

async function populateStageAssignee(doc) {
  return TaskStageAssignee.findById(doc._id)
    .populate("workflowStageId", "name workflowId allowedRoles isStart isEnd order")
    .populate({
      path: "projectMemberId",
      populate: [
        { path: "user", select: "name email avatar" },
        { path: "roles", select: "name color" },
      ],
    })
    .populate("assignedBy", "name email avatar")
    .lean();
}

function buildEligibleMembersForStage(stage, projectMembers, workspaceRoleMap) {
  const stageRoleIds = (stage.allowedRoles || []).map((role) => normalizeId(role._id || role.id || role));

  return projectMembers
    .filter((member) => {
      const workspaceRole = String(workspaceRoleMap.get(normalizeId(member.user?._id || member.user)) || "").toUpperCase();
      if (workspaceRole !== WORKSPACE_MEMBER_ROLE) return false;

      if (stageRoleIds.length === 0) return true;

      const projectRoleIds = (member.roles || []).map((role) => normalizeId(role._id || role.id || role));
      return projectRoleIds.some((roleId) => stageRoleIds.includes(roleId));
    })
    .map((member) => ({
      _id: member._id,
      user: member.user,
      roles: member.roles || [],
      workspaceRole: String(workspaceRoleMap.get(normalizeId(member.user?._id || member.user)) || "").toUpperCase(),
    }));
}

export async function getTaskStageAssignmentBundle(taskId) {
  const task = await Task.findById(taskId)
    .populate("categoryId", "name color")
    .populate("workflowId", "name version")
    .populate("currentStageId", "name isStart isEnd allowedRoles order")
    .populate("createdBy", "name email avatar")
    .lean();

  if (!task) {
    throw new Error("Task not found");
  }

  if (!task.workflowId) {
    return {
      task,
      workflowStages: [],
      stageAssignments: [],
      stageAssignees: [],
      eligibleMembersByStage: [],
    };
  }

  const project = await loadTaskProject(task);
  const [workflowStages, projectMembers, stageAssignees] = await Promise.all([
    WorkflowStage.find({ workflowId: task.workflowId._id || task.workflowId })
      .populate("allowedRoles", "name color")
      .sort({ order: 1, createdAt: 1 })
      .lean(),
    ProjectMember.find({ project: task.projectId })
      .populate("user", "name email avatar")
      .populate("roles", "name color")
      .lean(),
    TaskStageAssignee.find({ taskId })
      .populate("workflowStageId", "name workflowId allowedRoles isStart isEnd order")
      .populate({
        path: "projectMemberId",
        populate: [
          { path: "user", select: "name email avatar" },
          { path: "roles", select: "name color" },
        ],
      })
      .populate("assignedBy", "name email avatar")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  const workspaceMembers = await WorkspaceMember.find({
    workspaceId: project.workspace,
    userId: { $in: projectMembers.map((member) => member.user?._id || member.user) },
  })
    .select("userId role")
    .lean();

  const workspaceRoleMap = new Map(
    workspaceMembers.map((member) => [normalizeId(member.userId), String(member.role || "").toUpperCase()])
  );

  const stageAssignments = workflowStages.map((stage) => {
    const assignees = stageAssignees.filter(
      (assignment) => normalizeId(assignment.workflowStageId?._id || assignment.workflowStageId) === normalizeId(stage._id)
    );
    const eligibleMembers = buildEligibleMembersForStage(stage, projectMembers, workspaceRoleMap);

    return {
      stage,
      assignees,
      eligibleMembers,
    };
  });

  return {
    task,
    workflowStages,
    stageAssignments,
    stageAssignees,
    eligibleMembersByStage: stageAssignments.map((entry) => ({
      stageId: entry.stage._id,
      eligibleMembers: entry.eligibleMembers,
    })),
  };
}

export async function canUserViewTaskByStageAssignments({ taskId, userId, workspaceRole }) {
  if (isAdminRole(workspaceRole)) {
    return true;
  }

  if (String(workspaceRole || "").toUpperCase() !== WORKSPACE_MEMBER_ROLE) {
    return false;
  }

  const task = await Task.findById(taskId).select("projectId").lean();
  if (!task) {
    return false;
  }

  const projectMember = await ProjectMember.findOne({
    project: task.projectId,
    user: userId,
  })
    .select("_id")
    .lean();

  if (!projectMember) {
    return false;
  }

  return Boolean(
    await TaskStageAssignee.exists({
      taskId,
      projectMemberId: projectMember._id,
    })
  );
}

export async function addTaskStageAssignee({ taskId, stageId, projectMemberId, assignedBy }) {
  const task = await loadTaskScope(taskId);
  const project = await loadTaskProject(task);
  const stage = await loadTaskStage(task, stageId);
  const projectMember = await loadProjectMember(task, projectMemberId);
  await assertEligibleAssignee({ task, stage, projectMember, workspaceId: project.workspace });

  const existing = await TaskStageAssignee.findOne({
    taskId,
    workflowStageId: stage._id,
    projectMemberId: projectMember._id,
  }).lean();

  if (existing) {
    throw new Error("This project member is already assigned to the stage");
  }

  const created = await TaskStageAssignee.create({
    taskId,
    workflowStageId: stage._id,
    projectMemberId: projectMember._id,
    assignedBy,
  });

  return populateStageAssignee(created);
}

export async function removeTaskStageAssignee({ taskId, stageId, projectMemberId }) {
  const task = await loadTaskScope(taskId);
  const stage = await loadTaskStage(task, stageId);
  const projectMember = await loadProjectMember(task, projectMemberId);

  const deleted = await TaskStageAssignee.findOneAndDelete({
    taskId,
    workflowStageId: stage._id,
    projectMemberId: projectMember._id,
  }).lean();

  if (!deleted) {
    throw new Error("Stage assignee not found");
  }

  return deleted;
}

export async function replaceTaskStageAssignees({ taskId, stageId, projectMemberIds = [], assignedBy }) {
  const task = await loadTaskScope(taskId);
  const project = await loadTaskProject(task);
  const stage = await loadTaskStage(task, stageId);
  const uniqueMemberIds = uniqueIdList(projectMemberIds);

  const validatedMembers = [];
  for (const memberId of uniqueMemberIds) {
    const projectMember = await loadProjectMember(task, memberId);
    await assertEligibleAssignee({ task, stage, projectMember, workspaceId: project.workspace });
    validatedMembers.push(projectMember);
  }

  await TaskStageAssignee.deleteMany({
    taskId,
    workflowStageId: stage._id,
  });

  if (validatedMembers.length > 0) {
    await TaskStageAssignee.insertMany(
      validatedMembers.map((member) => ({
        taskId,
        workflowStageId: stage._id,
        projectMemberId: member._id,
        assignedBy,
      })),
      { ordered: true }
    );
  }

  return getTaskStageAssignmentBundle(taskId);
}

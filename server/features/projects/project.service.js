import { Project } from "./project.model.js";
import { ProjectRole } from "./projectRole.model.js";
import { ProjectMember } from "./projectMember.model.js"
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { Workspace } from "../workspaces/workspace.model.js";
import mongoose from "mongoose";
import {
  PROJECT_CLIENT_ROLE_NAME,
  PROJECT_CLIENT_ROLE_PERMISSIONS,
  PROJECT_SYSTEM_ROLE_NAMES,
} from "./projectRole.constants.js";

const PROJECT_PERMISSION_KEYS = [
  "canManageProject",
  "canManageMembers",
  "canInviteMembers",
  "canCreateTask",
  "canEditTask",
  "canDeleteTask",
  "canViewActivity",
];

function createProjectPermissions(overrides = {}) {
  return PROJECT_PERMISSION_KEYS.reduce((acc, key) => {
    acc[key] = Boolean(overrides[key]);
    return acc;
  }, {});
}

function mergeRolePermissions(roles = []) {
  return roles.reduce((acc, role) => {
    const permissions = role?.permissions || {};
    for (const key of PROJECT_PERMISSION_KEYS) {
      acc[key] = Boolean(acc[key] || permissions[key]);
    }
    return acc;
  }, createProjectPermissions());
}

export const ensureProjectClientRole = async (projectId) => {
  if (!projectId) {
    throw new Error("Project ID is required");
  }

  return await ProjectRole.findOneAndUpdate(
    {
      project: projectId,
      name: PROJECT_CLIENT_ROLE_NAME,
    },
    {
      $set: {
        permissions: {
          ...PROJECT_CLIENT_ROLE_PERMISSIONS,
        },
      },
      $setOnInsert: {
        project: projectId,
        name: PROJECT_CLIENT_ROLE_NAME,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
};

export const createProject = async ({
  name,
  description,
  avatar,
  workspaceId,
  userId,
}) => {
  const createdProject = await Project.create({
    name,
    description,
    avatar,
    workspace: workspaceId,
    createdBy: userId,
  });

  await ensureProjectClientRole(createdProject._id);

  return createdProject;
};

export const updateProject = async (projectId, updateData) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return updatedProject;
  } catch (error) {
    console.error("Update Project Error:", error);
    throw error;
  }
};

// * Project Global State

export const getProjectGlobalStateBySlug = async ({
  slug,
  userId,
  workspaceSlug,
}) => {
  try {
    if (!slug || !userId) {
      throw new Error("Slug and User ID are required");
    }

    const projectQuery = { slug };

    if (workspaceSlug) {
      const workspace = await Workspace.findOne({ slug: workspaceSlug }).lean();

      if (!workspace) {
        throw new Error("Workspace not found");
      }

      projectQuery.workspace = workspace._id;
    }

    const project = await Project.findOne(projectQuery).lean();

    if (!project) {
      throw new Error("Project not found");
    }

    const workspaceMember = await WorkspaceMember.findOne({
      workspaceId: project.workspace,
      userId: userId,
    });

    if (!workspaceMember) {
      throw new Error("Access denied");
    }

    const isWorkspaceAdmin = ["OWNER", "ADMIN"].includes(
      workspaceMember.role
    );

    const memberships = await ProjectMember.find({
      project: project._id,
    })
      .populate("roles", "name permissions")
      .lean();

    const currentMembership = memberships.find(
      (m) => m.user.toString() === userId.toString()
    );

    if (!currentMembership && !isWorkspaceAdmin) {
      throw new Error("Access denied");
    }

    const currentUserRoles = currentMembership?.roles || [];
    const currentUserRoleNames = currentUserRoles.map((role) => role?.name).filter(Boolean);
    const currentUserRole = currentUserRoleNames[0] || null;
    const currentUserPermissions = isWorkspaceAdmin
      ? createProjectPermissions({ canManageProject: true, canManageMembers: true, canInviteMembers: true, canCreateTask: true, canEditTask: true, canDeleteTask: true, canViewActivity: true })
      : mergeRolePermissions(currentUserRoles);

    return {
      project,
      memberships,
      currentUserRole,
      currentUserRoles,
      currentUserRoleNames,
      currentUserPermissions,
      workspaceRole: workspaceMember.role,
      totalMembers: memberships.length,
    };
  } catch (error) {
    console.error("Get Project Global State Error:", error);
    throw error;
  }
};

// * PROJECT ROLES

/*
 * Create single role
 */
export const createProjectRole = async ({
  name,
  projectId,
  permissions = {},
}) => {
  try {
    if (!name || !name.trim()) {
      throw new Error("Role name is required");
    }

    if (PROJECT_SYSTEM_ROLE_NAMES.includes(name.trim())) {
      throw new Error("Cannot create system roles manually");
    }

    const existing = await ProjectRole.findOne({
      project: projectId,
      name: name.trim(),
    });

    if (existing) {
      throw new Error("Role already exists in this project");
    }

    const role = await ProjectRole.create({
      name: name.trim(),
      project: projectId,

      permissions: {
        canManageProject: permissions.canManageProject || false,
        canManageMembers: permissions.canManageMembers || false,
        canInviteMembers: permissions.canInviteMembers || false,

        canCreateTask:
          permissions.canCreateTask !== undefined
            ? permissions.canCreateTask
            : true,

        canEditTask:
          permissions.canEditTask !== undefined
            ? permissions.canEditTask
            : true,

        canDeleteTask: permissions.canDeleteTask || false,

        canViewActivity:
          permissions.canViewActivity !== undefined
            ? permissions.canViewActivity
            : true,
      },
    });

    return role;
  } catch (error) {
    console.error("Create Project Role Error:", error);
    throw error;
  }
};

/**
 * Create multiple roles
 */
export const createMultipleProjectRole = async ({
  projectId,
  roles = [],
}) => {
  try {
    if (!projectId) throw new Error("Project ID is required");
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error("Roles array is required");
    }

    const invalidSystemRole = roles.find((role) =>
      PROJECT_SYSTEM_ROLE_NAMES.includes(String(role?.name || "").trim())
    );

    if (invalidSystemRole) {
      throw new Error("Cannot create system roles manually");
    }

    const formattedRoles = roles.map((role) => ({
      name: role.name.trim(),
      project: projectId,

      permissions: {
        canManageProject: role?.permissions?.canManageProject || false,
        canManageMembers: role?.permissions?.canManageMembers || false,
        canInviteMembers: role?.permissions?.canInviteMembers || false,

        canCreateTask:
          role?.permissions?.canCreateTask !== undefined
            ? role.permissions.canCreateTask
            : true,

        canEditTask:
          role?.permissions?.canEditTask !== undefined
            ? role.permissions.canEditTask
            : true,

        canDeleteTask: role?.permissions?.canDeleteTask || false,

        canViewActivity:
          role?.permissions?.canViewActivity !== undefined
            ? role.permissions.canViewActivity
            : true,
      },
    }));

    return await ProjectRole.insertMany(formattedRoles);
  } catch (error) {
    console.error("Create Multiple Roles Error:", error);
    throw error;
  }
};

/**
 * Delete role (safe)
 */
export const deleteProjectRole = async ({ roleId, projectId }) => {
  try {
    if (!roleId || !projectId) {
      throw new Error("Role ID and Project ID are required");
    }

    const roleToDelete = await ProjectRole.findOne({
      _id: roleId,
      project: projectId,
    });

    if (!roleToDelete) {
      throw new Error("Role not found");
    }

    if (PROJECT_SYSTEM_ROLE_NAMES.includes(roleToDelete.name)) {
      throw new Error("System roles cannot be deleted");
    }

    const memberUsingRole = await ProjectMember.findOne({
      project: projectId,
      roles: roleId,
    });

    if (memberUsingRole) {
      throw new Error(
        "Cannot delete role. Members are still assigned to this role"
      );
    }

    const role = await ProjectRole.findOneAndDelete({
      _id: roleId,
      project: projectId,
    });

    return role;
  } catch (error) {
    console.error("Delete Role Error:", error);
    throw error;
  }
};

/**
 * Get single role
 */
export const getProjectRole = async ({ roleId, projectId }) => {
  try {
    if (!roleId || !projectId) {
      throw new Error("Role ID and Project ID are required");
    }

    const role = await ProjectRole.findOne({
      _id: roleId,
      project: projectId,
    });

    if (!role) {
      throw new Error("Role not found");
    }

    return role;
  } catch (error) {
    console.error("Get Role Error:", error);
    throw error;
  }
};
/**
 * Get all roles
 */
export const getAllProjectRoles = async ({ projectId, search }) => {
  try {
    if (!projectId) throw new Error("Project ID is required");

    await ensureProjectClientRole(projectId);

    const query = { project: projectId };

    if (search && String(search).trim()) {
      query.name = { $regex: String(search).trim(), $options: "i" };
    }

    return await ProjectRole.find(query).sort({
      createdAt: 1,
    });
  } catch (error) {
    console.error("Get All Roles Error:", error);
    throw error;
  }
};

async function getProjectWorkspaceRole({ projectId, userId }) {
  const project = await Project.findById(projectId).select("workspace");

  if (!project) {
    throw new Error("Project not found");
  }

  const workspaceMember = await WorkspaceMember.findOne({
    workspaceId: project.workspace,
    userId,
  }).lean();

  if (!workspaceMember) {
    throw new Error("User is not a member of the workspace");
  }

  return {
    workspaceId: project.workspace,
    workspaceRole: workspaceMember?.role?.toUpperCase() || null,
  };
}

async function enforceClientProjectRole({ projectId, userId, roleIds }) {
  const { workspaceRole } = await getProjectWorkspaceRole({
    projectId,
    userId,
  });

  if (!["MEMBER", "CLIENT"].includes(workspaceRole)) {
    throw new Error("Only workspace members and clients can be assigned to projects");
  }

  if (workspaceRole !== "CLIENT") {
    return { roleIds };
  }

  const clientRole = await ensureProjectClientRole(projectId);
  const normalizedRoleIds = Array.isArray(roleIds)
    ? roleIds.map((roleId) => String(roleId))
    : [];

  if (normalizedRoleIds.length === 0) {
    return { roleIds: [clientRole._id] };
  }

  const isOnlyClientRole =
    normalizedRoleIds.length === 1 &&
    String(normalizedRoleIds[0]) === String(clientRole._id);

  if (!isOnlyClientRole) {
    throw new Error("Workspace clients can only be assigned the Project Client role");
  }

  return { roleIds: [clientRole._id] };
}

/**
 * Update role (name + permissions only)
 */
export const updateProjectRole = async ({
  roleId,
  projectId,
  name,
  permissions,
}) => {
  try {
    if (!roleId || !projectId) {
      throw new Error("Role ID and Project ID are required");
    }

    const updateData = {};

    const existingRole = await ProjectRole.findOne({
      _id: roleId,
      project: projectId,
    });

    if (!existingRole) {
      throw new Error("Role not found");
    }

    if (PROJECT_SYSTEM_ROLE_NAMES.includes(existingRole.name)) {
      throw new Error("System roles cannot be modified");
    }

    if (name !== undefined) {
      if (!name.trim()) throw new Error("Role name cannot be empty");
      if (PROJECT_SYSTEM_ROLE_NAMES.includes(name.trim())) {
        throw new Error("Cannot rename to a system role");
      }
      updateData.name = name.trim();
    }

    if (permissions !== undefined) {
      updateData.permissions = permissions;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Nothing to update");
    }

    const updatedRole = await ProjectRole.findOneAndUpdate(
      { _id: roleId, project: projectId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return updatedRole;
  } catch (error) {
    console.error("Update Role Error:", error);
    throw error;
  }
};






// * Project Members

/**
 * Add a single member to project (multi-role)
 */
export const createProjectMember = async ({
  projectId,
  userId,
  roleIds = [],
}) => {
  try {
    if (!projectId || !userId || !Array.isArray(roleIds)) {
      throw new Error("Project, User and roleIds array are required");
    }

    const effectiveRoleIds = await enforceClientProjectRole({
      projectId,
      userId,
      roleIds,
    });

    if (!effectiveRoleIds.roleIds.length) {
      throw new Error("Project, User and at least one Role are required");
    }

    // Validate roles belong to project
    const validRoles = await ProjectRole.find({
      _id: { $in: effectiveRoleIds.roleIds },
      project: projectId,
    });

    if (validRoles.length !== effectiveRoleIds.roleIds.length) {
      throw new Error("One or more roles are invalid for this project");
    }

    // Check existing member
    const existing = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (existing) {
      throw new Error("User is already a member of this project");
    }

    const member = await ProjectMember.create({
      project: projectId,
      user: userId,
      roles: effectiveRoleIds.roleIds,
    });

    return member;
  } catch (error) {
    console.error("Create Project Member Error:", error);
    throw error;
  }
};

/**
 * Get all members
 */

export const getProjectMembers = async ({ projectId, search }) => {
  try {
    if (!projectId) throw new Error("Project ID is required");

    const pipeline = [
      {
        $match: {
          project: new mongoose.Types.ObjectId(projectId),
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      ...(search
        ? [
          {
            $match: {
              $or: [
                {
                  "user.name": {
                    $regex: search,
                    $options: "i",
                  },
                },
                {
                  "user.email": {
                    $regex: search,
                    $options: "i",
                  },
                },
              ],
            },
          },
        ]
        : []),

      {
        $lookup: {
          from: "projectroles",
          localField: "roles",
          foreignField: "_id",
          as: "roles",
        },
      },

      {
        $project: {
          _id: 1,
          createdAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.avatar": 1,
          roles: { _id: 1, name: 1 },
        },
      },

      { $sort: { createdAt: 1 } },
    ];

    const members = await ProjectMember.aggregate(pipeline);

    return members;
  } catch (error) {
    console.error("Get Project Members Error:", error);
    throw error;
  }
};
/**
 * Get single member
 */
export const getProjectMember = async ({
  projectId,
  memberId,
  search
}) => {
  try {
    if (!projectId || !memberId) {
      throw new Error("Project ID and Member ID are required");
    }

    const member = await ProjectMember.findOne({
      _id: memberId,
      project: projectId,
    })
      .populate("user", "name email avatar")
      .populate("roles", "name");

    if (!member) {
      throw new Error("Member not found");
    }

    return member;
  } catch (error) {
    console.error("Get Project Member Error:", error);
    throw error;
  }
};

/**
 * Update member roles (🔥 IMPORTANT NEW)
 */
export const updateProjectMemberRoles = async ({
  projectId,
  memberId,
  roleIds = [],
}) => {
  try {
    if (!projectId || !memberId || !Array.isArray(roleIds)) {
      throw new Error("Project, Member and roleIds are required");
    }

    const memberDoc = await ProjectMember.findOne({
      _id: memberId,
      project: projectId,
    }).select("user");

    if (!memberDoc) {
      throw new Error("Member not found");
    }

    const effectiveRoleIds = await enforceClientProjectRole({
      projectId,
      userId: memberDoc.user,
      roleIds,
    });

    // Validate roles
    const validRoles = await ProjectRole.find({
      _id: { $in: effectiveRoleIds.roleIds },
      project: projectId,
    });

    if (validRoles.length !== effectiveRoleIds.roleIds.length) {
      throw new Error("Invalid roles provided");
    }

    const member = await ProjectMember.findOneAndUpdate(
      { _id: memberId, project: projectId },
      { roles: effectiveRoleIds.roleIds },
      { new: true }
    )
      .populate("user", "name email avatar")
      .populate("roles", "name");

    if (!member) {
      throw new Error("Member not found");
    }

    return member;
  } catch (error) {
    console.error("Update Member Roles Error:", error);
    throw error;
  }
};

/**
 * Remove single member
 */
export const removeProjectMember = async ({
  projectId,
  memberId,
}) => {
  try {
    if (!projectId || !memberId) {
      throw new Error("Project ID and Member ID are required");
    }

    const member = await ProjectMember.findOneAndDelete({
      _id: memberId,
      project: projectId,
    });

    if (!member) {
      throw new Error("Member not found");
    }

    return member;
  } catch (error) {
    console.error("Remove Project Member Error:", error);
    throw error;
  }
};

/**
 * Remove multiple members
 */
export const removeMultipleProjectMember = async ({
  projectId,
  memberIds = [],
}) => {
  try {
    if (!projectId || !Array.isArray(memberIds) || memberIds.length === 0) {
      throw new Error("Project ID and memberIds array are required");
    }

    const result = await ProjectMember.deleteMany({
      project: projectId,
      _id: { $in: memberIds },
    });

    return result;
  } catch (error) {
    console.error("Remove Multiple Members Error:", error);
    throw error;
  }
};

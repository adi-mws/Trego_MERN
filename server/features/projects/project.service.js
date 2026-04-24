import { Project } from "./project.model.js";
import { ProjectRole } from "./projectRole.model.js";
import { ProjectMember } from "./projectMember.model.js"
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import mongoose from "mongoose";
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
}) => {
  try {
    if (!slug || !userId) {
      throw new Error("Slug and User ID are required");
    }

    const project = await Project.findOne({ slug }).lean();

    if (!project) {
      throw new Error("Project not found");
    }

    // ✅ FIXED HERE
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

    return {
      project,
      memberships,
      currentUserRole: currentMembership?.role || null,
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

    const systemRoleNames = ["Head Management", "Project Manager"];

    if (systemRoleNames.includes(name.trim())) {
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

    const memberUsingRole = await ProjectMember.findOne({
      project: projectId,
      role: roleId,
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

    if (!role) {
      throw new Error("Role not found");
    }

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

    if (name !== undefined) {
      if (!name.trim()) throw new Error("Role name cannot be empty");
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

    if (!updatedRole) {
      throw new Error("Role not found");
    }

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
    if (!projectId || !userId || !Array.isArray(roleIds) || roleIds.length === 0) {
      throw new Error("Project, User and at least one Role are required");
    }

    // Validate roles belong to project
    const validRoles = await ProjectRole.find({
      _id: { $in: roleIds },
      project: projectId,
    });

    if (validRoles.length !== roleIds.length) {
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
      roles: roleIds,
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

    // Validate roles
    const validRoles = await ProjectRole.find({
      _id: { $in: roleIds },
      project: projectId,
    });

    if (validRoles.length !== roleIds.length) {
      throw new Error("Invalid roles provided");
    }

    const member = await ProjectMember.findOneAndUpdate(
      { _id: memberId, project: projectId },
      { roles: roleIds },
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

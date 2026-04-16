import { Project } from "./project.model.js";
import { ProjectRole } from "./projectRole.model.js";
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




// * PROJECT ROLES
// Create Project Role
export const createProjectRole = async ({
  name,
  projectId,
  permissions = {},
}) => {
  try {
    const systemRoleNames = ["Head Management", "Project Manager"];

    if (systemRoleNames.includes(name)) {
      throw new Error("Cannot create system roles manually");
    }
    //  Check duplicate role name inside project
    const existing = await ProjectRole.findOne({
      project: projectId,
      name: name.trim(),
    });

    if (existing) {
      throw new Error("Role with this name already exists in this project");
    }
    //  Create role
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
    console.error("Error creating project role:", error);
    throw error;
  }
};




export const createMultipleProjectRole = async ({
  projectId,
  roles = [],
}) => {
  try {
    if (!projectId) throw new Error("Project ID is required");
    if (!Array.isArray(roles) || roles.length === 0) {
      throw new Error("Roles array is required");
    }

    // sanitize + normalize
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
      priority: role.priority ?? 0,
    }));

    const createdRoles = await ProjectRole.insertMany(formattedRoles);

    return createdRoles;
  } catch (error) {
    console.error("Create Multiple Project Roles Error:", error);
    throw error;
  }
};


export const deleteProjectRole = async ({ roleId, projectId }) => {
  try {
    if (!roleId || !projectId) {
      throw new Error("Role ID and Project ID are required");
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
    console.error("Delete Project Role Error:", error);
    throw error;
  }
};



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
    console.error("Get Project Role Error:", error);
    throw error;
  }
};

/**
 * Get all roles of a project
 */
export const getAllProjectRoles = async ({ projectId }) => {
  try {
    if (!projectId) throw new Error("Project ID is required");

    const roles = await ProjectRole.find({ project: projectId })
      .sort({ priority: -1, createdAt: 1 });

    return roles;
  } catch (error) {
    console.error("Get All Project Roles Error:", error);
    throw error;
  }
};


export const updateProjectRole = async ({
  roleId,
  projectId,
  name,
  priority,
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

    if (priority !== undefined) {
      updateData.priority = priority;
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
    console.error("Update Project Role Error:", error);
    throw error;
  }
};



// * Project Members

/**
 * Add a single member to project
 */
export const createProjectMember = async ({
  projectId,
  userId,
  roleId,
}) => {
  try {
    if (!projectId || !userId || !roleId) {
      throw new Error("Project, User and Role are required");
    }

    const role = await ProjectRole.findOne({
      _id: roleId,
      project: projectId,
    });

    if (!role) {
      throw new Error("Invalid role for this project");
    }

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
      role: roleId,
    });

    return member;
  } catch (error) {
    console.error("Create Project Member Error:", error);
    throw error;
  }
};

/**
 * Get all members of a project
 */
export const getProjectMembers = async ({ projectId }) => {
  try {
    if (!projectId) throw new Error("Project ID is required");

    const members = await ProjectMember.find({ project: projectId })
      .populate("user", "name email pfp")
      .populate("role", "name priority")
      .sort({ createdAt: 1 });

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
}) => {
  try {
    if (!projectId || !memberId) {
      throw new Error("Project ID and Member ID are required");
    }

    const member = await ProjectMember.findOne({
      _id: memberId,
      project: projectId,
    })
      .populate("user", "name email pfp")
      .populate("role", "name priority");

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

    return result; // contains deletedCount
  } catch (error) {
    console.error("Remove Multiple Members Error:", error);
    throw error;
  }
};
import { saveFile } from "../../utils/upload.utils.js";
import {
  createProject, createProjectRole,
  createMultipleProjectRole,
  deleteProjectRole,
  getProjectRole,
  getAllProjectRoles,
  updateProjectRole,

  createProjectMember,
  getProjectMembers,
  getProjectMember,
  removeProjectMember,
  removeMultipleProjectMember,
  getProjectGlobalStateBySlug,
} from "./project.service.js";

export const createProjectController = async (req, res, next) => {
  try {
    const { name, description, workspaceId } = req.body;
    const userId = req.user?.userId;

    const avatarUrl = await saveFile(req.file, "projects/avatar");

    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Name and workspaceId are required",
      });
    }

    const project = await createProject({
      name,
      description,
      avatar: avatarUrl,
      workspaceId,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    next(error);
  }
};

// * Project Global State

export const getProjectGlobalStateBySlugController = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const userId = req.user?.userId;

    const data = await getProjectGlobalStateBySlug({
      slug,
      userId,
    });

    return res.status(200).json({
      ...data,
    });
  } catch (error) {
    next(error);
  }
};

// * Project Roles


export const createProjectRoleController = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    const { projectId } = req.params;
    console.log(projectId);

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Role name is required",
      });
    }

    const role = await createProjectRole({
      name,
      projectId,
      permissions,
    });

    return res.status(201).json({
      success: true,
      message: "Project role created successfully",
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const createMultipleProjectRoleController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { roles } = req.body;

    const createdRoles = await createMultipleProjectRole({
      projectId,
      roles,
    });

    return res.status(201).json({
      success: true,
      message: "Project roles created successfully",
      roles: createdRoles,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProjectRoleController = async (req, res, next) => {
  try {
    const { projectId, roleId } = req.params;

    const deletedRole = await deleteProjectRole({
      roleId,
      projectId,
    });

    return res.status(200).json({
      success: true,
      message: "Project role deleted successfully",
      role: deletedRole,
    });
  } catch (error) {
    next(error);
  }
};

export const getProjectRoleController = async (req, res, next) => {
  try {
    const { projectId, roleId } = req.params;

    const role = await getProjectRole({
      roleId,
      projectId,
    });

    return res.status(200).json({
      success: true,
      role,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProjectRolesController = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const roles = await getAllProjectRoles({ projectId });

    return res.status(200).json({
      success: true,
      roles,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProjectRoleController = async (req, res, next) => {
  try {
    const { projectId, roleId } = req.params;
    const { name, permissions } = req.body;

    const updatedRole = await updateProjectRole({
      roleId,
      projectId,
      name,
      permissions,
    });

    return res.status(200).json({
      success: true,
      message: "Project role updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    next(error);
  }
};



// * PROJECT MEMBERS

/**
 * Add member to project
 */
export const createProjectMemberController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, roleId } = req.body;

    if (!userId || !roleId) {
      return res.status(400).json({
        success: false,
        message: "User ID and Role ID are required",
      });
    }

    const member = await createProjectMember({
      projectId,
      userId,
      roleId,
    });

    return res.status(201).json({
      success: true,
      message: "Member added to project",
      member,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all project members
 */
export const getProjectMembersController = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const members = await getProjectMembers({ projectId });

    return res.status(200).json({
      success: true,
      members,
    });
  } catch (error) {
    next(error)
  }
};

/**
 * Get single project member
 */
export const getProjectMemberController = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;

    const member = await getProjectMember({
      projectId,
      memberId,
    });

    return res.status(200).json({
      success: true,
      member,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove single member
 */
export const removeProjectMemberController = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;

    const member = await removeProjectMember({
      projectId,
      memberId,
    });

    return res.status(200).json({
      success: true,
      message: "Member removed from project",
      member,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove multiple members
 */
export const removeMultipleProjectMemberController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "memberIds array is required",
      });
    }

    const result = await removeMultipleProjectMember({
      projectId,
      memberIds,
    });

    return res.status(200).json({
      success: true,
      message: "Members removed successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    next(error)
  }
};
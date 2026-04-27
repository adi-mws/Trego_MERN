import { saveFile } from "../../utils/upload.utils.js";
import { Project } from "./project.model.js";
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
  updateProjectMemberRoles,
  updateProject,
} from "./project.service.js";
import { generateProjectChatReply } from "./projectChat.service.js";
import { Workspace } from "../workspaces/workspace.model.js";
import {
  createProjectCreationNotification,
  createProjectMemberAddedNotification,
  createProjectMemberRemovedNotification,
} from "../notifications/notification.service.js";
import { emitToUser } from "../../socket/index.js";

export const createProjectController = async (req, res, next) => {
  try {
    const { name, description, workspaceId } = req.body;
    const userId = req.user?.userId;

    const avatarUrl = await saveFile(req.file, "projects/avatar");

    if (!name || !workspaceId) {
      return res.status(400).json({ success: false, message: "Name and workspaceId are required" });
    }

    const project = await createProject({ name, description, avatar: avatarUrl, workspaceId, userId });

    const workspace = await Workspace.findById(workspaceId).select("_id name slug").lean();

    await createProjectCreationNotification({
      project,
      workspace,
      userId,
      sourceSessionId: req.user?.sessionId,
    }).catch((err) => {
      console.warn("Failed to create project notification:", err.message);
    });

    return res.status(201).json({ success: true, message: "Project created successfully", project });
  } catch (error) {
    next(error);
  }
};

export const updateProjectController = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const updateData = { ...req.body };
    if (req.file) {
      updateData.avatar = await saveFile(req.file, "projects/avatar");
    }

    const project = await updateProject(projectId, updateData);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    return res.status(200).json({ success: true, message: "Project updated successfully", project });
  } catch (error) {
    next(error);
  }
};


export const getProjectGlobalStateBySlugController = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { workspaceSlug } = req.query;


    const userId = req.user?.userId;
    const data = await getProjectGlobalStateBySlug({ slug, userId, workspaceSlug });
    return res.status(200).json({ ...data });
  } catch (error) {
    next(error);
  }
};

export const generateProjectChatReplyController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { message, history = [] } = req.body || {};

    const data = await generateProjectChatReply({
      projectId,
      userId: req.user?.userId,
      message,
      history: Array.isArray(history) ? history : [],
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const createProjectRoleController = async (req, res, next) => {
  try {
    const { name, permissions } = req.body;
    const { projectId } = req.params;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Role name is required" });
    }

    const role = await createProjectRole({ name, projectId, permissions });
    return res.status(201).json({ success: true, message: "Project role created successfully", role });
  } catch (error) {
    next(error);
  }
};

export const createMultipleProjectRoleController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { roles } = req.body;
    const createdRoles = await createMultipleProjectRole({ projectId, roles });
    return res.status(201).json({ success: true, message: "Project roles created successfully", roles: createdRoles });
  } catch (error) {
    next(error);
  }
};

export const deleteProjectRoleController = async (req, res, next) => {
  try {
    const { projectId, roleId } = req.params;
    const deletedRole = await deleteProjectRole({ roleId, projectId });
    return res.status(200).json({ success: true, message: "Project role deleted successfully", role: deletedRole });
  } catch (error) {
    next(error);
  }
};

export const getProjectRoleController = async (req, res, next) => {
  try {
    const { projectId, roleId } = req.params;
    const role = await getProjectRole({ roleId, projectId });
    return res.status(200).json({ success: true, role });
  } catch (error) {
    next(error);
  }
};

export const getAllProjectRolesController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { search } = req.query;
    const roles = await getAllProjectRoles({ projectId, search });
    return res.status(200).json({ success: true, roles });
  } catch (error) {
    next(error);
  }
};

export const updateProjectRoleController = async (req, res, next) => {
  try {
    const { projectId, roleId } = req.params;
    const { name, permissions } = req.body;
    const updatedRole = await updateProjectRole({ roleId, projectId, name, permissions });
    return res.status(200).json({ success: true, message: "Project role updated successfully", role: updatedRole });
  } catch (error) {
    next(error);
  }
};

export const createProjectMemberController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { userId, roleIds } = req.body;
    const actorUserId = req.user?.userId;

    if (!userId || !Array.isArray(roleIds) || roleIds.length === 0) {
      return res.status(400).json({ success: false, message: "User ID and roleIds array are required" });
    }

    const member = await createProjectMember({ projectId, userId, roleIds });

    const project = await Project.findById(projectId)
      .select("_id name slug workspace")
      .lean();

    const workspace = project?.workspace
      ? await Workspace.findById(project.workspace).select("_id name slug").lean()
      : null;

    await createProjectMemberAddedNotification({
      project,
      workspace,
      userId: actorUserId,
      targetUserId: userId,
      sourceSessionId: req.user?.sessionId,
    }).catch((err) => {
      console.warn("Failed to create project member notification:", err.message);
    });

    return res.status(201).json({ success: true, message: "Member added to project", member });
  } catch (error) {
    next(error);
  }
};

export const getProjectMembersController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { search } = req.query;
    const members = await getProjectMembers({ projectId, search });
    return res.status(200).json({ success: true, members });
  } catch (error) {
    next(error);
  }
};

export const getProjectMemberController = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;
    const member = await getProjectMember({ projectId, memberId });
    return res.status(200).json({ success: true, member });
  } catch (error) {
    next(error);
  }
};

export const updateProjectMemberRolesController = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;
    const { roleIds } = req.body;

    if (!Array.isArray(roleIds)) {
      return res.status(400).json({ success: false, message: "roleIds array is required" });
    }

    const member = await updateProjectMemberRoles({ projectId, memberId, roleIds });
    return res.status(200).json({ success: true, message: "Member roles updated", member });
  } catch (error) {
    next(error);
  }
};

export const removeProjectMemberController = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;
    const actorUserId = req.user?.userId;
    const sourceSessionId = req.user?.sessionId;

    const member = await removeProjectMember({ projectId, memberId });

    const project = await Project.findById(projectId)
      .select("_id name slug workspace")
      .lean();

    const workspace = project?.workspace
      ? await Workspace.findById(project.workspace).select("_id name slug").lean()
      : null;

    await createProjectMemberRemovedNotification({
      project,
      workspace,
      userId: actorUserId,
      sourceSessionId,
    }).catch((err) => {
      console.warn("Failed to create project member removal notification:", err.message);
    });

    const targetUserId = member?.user ? String(member.user) : null;
    if (targetUserId && project && workspace) {
      emitToUser(targetUserId, "workspace:project-member-removed", {
        project: {
          _id: project._id,
          name: project.name,
          slug: project.slug,
          workspace: workspace._id,
          workspaceSlug: workspace.slug,
          workspaceName: workspace.name,
        },
        workspace: {
          _id: workspace._id,
          name: workspace.name,
          slug: workspace.slug,
        },
        targetUserId,
        sourceSessionId,
      });
    }

    return res.status(200).json({ success: true, message: "Member removed from project", member });
  } catch (error) {
    next(error);
  }
};

export const removeMultipleProjectMemberController = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { memberIds } = req.body;

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ success: false, message: "memberIds array is required" });
    }

    const result = await removeMultipleProjectMember({ projectId, memberIds });
    return res.status(200).json({ success: true, message: "Members removed successfully", deletedCount: result.deletedCount });
  } catch (error) {
    next(error);
  }
};

import { Workspace } from "./workspace.model.js";
import { WorkspaceMember } from "./workspaceMember.model.js";
import * as workspaceService from "./workspace.service.js";
import mongoose from "mongoose";
/*  CREATE WORKSPACE  */
export const createWorkspace = async (req, res) => {
  try {
    const { name, slug, avatar, about } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Name and slug are required",
      });
    }

    const workspace = await workspaceService.createWorkspace({
      name,
      slug,
      avatar,
      about,
      ownerId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Workspace created successfully",
      workspace,
    });
  } catch (err) {
    // duplicate slug error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Workspace slug already exists",
      });
    } else {

      next(err);
    }
  }
};

/*  GET WORKSPACE BY ID  */
export const getWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await workspaceService.getWorkspaceById(id);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    res.json({
      success: true,
      workspace,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




/*  GET BY SLUG  */
export const getWorkspaceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const workspace = await workspaceService.getWorkspaceBySlug(slug);

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    res.json({
      success: true,
      workspace,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




/*  GET USER WORKSPACES  */
export const getUserWorkspaces = async (req, res) => {
  try {
    const workspaces = await workspaceService.getUserWorkspaces(
      req.user._id
    );

    res.json({
      success: true,
      count: workspaces.length,
      workspaces,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/*  UPDATE WORKSPACE  */
export const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    const workspace = await workspaceService.updateWorkspace(
      id,
      req.body
    );

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    res.json({
      success: true,
      message: "Workspace updated successfully",
      workspace,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/*  DELETE WORKSPACE  */
export const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;

    await workspaceService.deleteWorkspace(id);

    res.json({
      success: true,
      message: "Workspace deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const getWorkspaceListController = async (req, res) => {
  try {
    let { cursor, limit } = req.query;

    // sanitize limit
    limit = Math.min(Number(limit) || 10, 20);

    // validate cursor if provided
    if (cursor && !mongoose.Types.ObjectId.isValid(cursor)) {
      return res.status(400).json({
        success: false,
        message: "Invalid cursor",
      });
    }

    const result = await workspaceService.getWorkspacesInfinite({
      userId: req.user.userId,
      cursor,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("getWorkspaceListController error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch workspaces",
    });
  }
};




export const getWorkspaceGlobalStateController = async (req, res) => {
  try {
    const { slug } = req.params;

    const workspace = await workspaceService.getWorkspaceGlobalState(slug, req.user.userId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    res.json({
      success: true,
      workspace,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};






export const generateWorkspaceInviteController = async (req, res) => {
  try {
    let {
      workspaceId,
      role = "MEMBER",
      expiryHours = 24,
      maxUses = 1,
    } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!workspaceId || !mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspaceId",
      });
    }

    // Check workspace exists
    const workspace = await Workspace.findById(workspaceId).select("_id");

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }

    const member = await WorkspaceMember.findOne({
      workspaceId,
      userId,
    }).lean();

    const allowedRoles = ["ADMIN", "OWNER"];

    const userRole = member?.role?.toUpperCase();

    if (!member || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "Only admins and owners can create invites",
      });
    }

    // Normalize role input
    role = role.toUpperCase();

    const { link } = await workspaceService.generateWorkspaceInvite({
      workspaceId,
      createdById: userId,
      role,
      expiryHours,
      maxUses,
    });

    res.status(201).json({
      success: true,
      link,
    });

  } catch (err) {
    console.error("Generate invite error:", err);

    res.status(500).json({
      success: false,
      message: err.message || "Failed to generate invite",
    });
  }
};



export const joinWorkspaceByInviteController = async (req, res) => {
  try {
    const { code } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Invite code is required",
      });
    }

    const data = await workspaceService.joinWorkspaceByInvite({
      code,
      userId,
    });

    res.json({
      success: true,
      ...data,
      message: "Joined workspace successfully",
    });

  } catch (err) {
    console.error("Join workspace error:", err);

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


export const getWorkspaceMemberProfileController = async (req, res) => {
  try {
    const { userId, workspaceId } = req.body;
    const viewerId = req.user?.userId;

    if (!viewerId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!userId || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "userId and workspaceId are required",
      });
    }

    const data = await workspaceService.getWorkspaceMemberProfile({
      userId,
      workspaceId,
      viewerId,
    });

    res.json({
      success: true,
      data,
    });

  } catch (err) {
    console.error("Get member profile error:", err);

    res.status(400).json({
      success: false,
      message: err.message || "Failed to fetch member profile",
    });
  }
};


export const getWorkspaceMembersSummaryController = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;

    //  Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspaceId",
      });
    }

    const data = await workspaceService.getWorkspaceMembersSummary(workspaceId);

    return res.status(200).json({
      success: true,
      counts: data.counts,
      members: data.members,
    });
  } catch (error) {
    console.error("Get Workspace Members Error:", error);

    next(error)
  }
};


export const getWorkspaceMembersByRoleController = async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    let { role } = req.query;

    // validate workspaceId
    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspaceId",
      });
    }

    // normalize role
    if (role) {
      role = role.toUpperCase();
    }

    const members = await workspaceService.getWorkspaceMembersByRole(workspaceId, role);

    return res.status(200).json({
      success: true,
      count: members.length,
      members,
    });
  } catch (error) {
    console.error("Get Members By Role Error:", error);

    next(error)
  }
};



export const updateWorkspaceMemberRoleController = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { targetUserId, role } = req.body;

    const currentUserId = req.user._id; // from auth middleware

    if (!mongoose.Types.ObjectId.isValid(workspaceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid workspaceId",
      });
    }

    const result = await workspaceService.updateWorkspaceMemberRole({
      workspaceId,
      currentUserId,
      targetUserId,
      newRole: role,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Role Update Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};



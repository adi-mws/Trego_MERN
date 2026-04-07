import * as workspaceService from "./workspace.service.js";

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
      ownerId: req.user._id,
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
    }

    res.status(500).json({
      success: false,
      message: err.message,
    });
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



export const getWOrkspaceList = async (req, res) => {   

}
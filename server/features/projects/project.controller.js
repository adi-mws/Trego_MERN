import { createProject } from "./project.service.js";

export const createProjectController = async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body;

    const userId = req.user?.id;

    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Name and workspaceId are required",
      });
    }

    const project = await createProject({
      name,
      description,
      avatar: req.file?.path || null,
      workspaceId,
      userId,
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: {
        project,
      },
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};
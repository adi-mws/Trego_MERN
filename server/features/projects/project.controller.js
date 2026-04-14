import { saveFile } from "../../utils/upload.utils.js";
import { createProject } from "./project.service.js";

export const createProjectController = async (req, res) => {
  try {
    const { name, description, workspaceId } = req.body;

    const userId = req.user?.userId;
    let avatarUrl = await saveFile(req.file, 'projects/avatar');

    if (!name || !workspaceId) {
      return res.status(400).json({
        success: false,
        message: "Name and workspaceId are required",
      });
    }
    const project = await createProject({
      name: name,
      description: description, 
      avatar: avatarUrl, 
      workspaceId: workspaceId, 
      userId: userId
    })

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: project
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};
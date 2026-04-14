import { Project } from "./project.model.js";

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
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { Workspace } from "../workspaces/workspace.model.js";
import { Project } from "../projects/project.model.js";
import { ProjectRole } from "../projects/projectRole.model.js";
import { Task } from "../tasks/task.model.js";
import { WorkflowTemplate } from "../workflows/workflowTemplate.model.js";

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeId = (value) => String(value || "");

const buildWorkspacePath = (workspaceSlug) => `/app/${workspaceSlug}`;
const buildProjectPath = (workspaceSlug, projectSlug) =>
  `${buildWorkspacePath(workspaceSlug)}/projects/${projectSlug}`;
const buildProjectRolesPath = (workspaceSlug, projectSlug) =>
  `${buildProjectPath(workspaceSlug, projectSlug)}/roles`;
const buildProjectTaskPath = (workspaceSlug, projectSlug, taskId) =>
  `${buildProjectPath(workspaceSlug, projectSlug)}/tasks/${taskId}`;
const buildProjectWorkflowPath = (workspaceSlug, projectSlug, workflowId) =>
  `${buildProjectPath(workspaceSlug, projectSlug)}/workflows/${workflowId}`;

const isMatch = (value, regex) => regex.test(String(value || ""));

const toResult = ({ type, title, subtitle, path, meta = {} }) => ({
  type,
  title,
  subtitle,
  path,
  meta,
});

export const searchWorkspaceEntities = async ({
  workspaceSlug,
  query,
  userId,
}) => {
  const searchTerm = String(query || "").trim();

  const workspace = await Workspace.findOne({ slug: workspaceSlug }).lean();
  if (!workspace) {
    const err = new Error("Workspace not found");
    err.status = 404;
    throw err;
  }

  const isOwner = normalizeId(workspace.ownerId) === normalizeId(userId);
  const workspaceMember = await WorkspaceMember.findOne({
    workspaceId: workspace._id,
    userId,
  }).lean();

  if (!isOwner && !workspaceMember) {
    const err = new Error("Access denied");
    err.status = 403;
    throw err;
  }

  const projects = await Project.find({ workspace: workspace._id })
    .select("_id name slug description")
    .sort({ updatedAt: -1 })
    .lean();

  const projectIds = projects.map((project) => String(project._id));
  const regex = searchTerm ? new RegExp(escapeRegex(searchTerm), "i") : null;

  const mapProject = (project) =>
    toResult({
      type: "project",
      title: project.name,
      subtitle: project.description || "Project",
      path: buildProjectPath(workspace.slug, project.slug),
      meta: {
        workspaceSlug: workspace.slug,
        projectSlug: project.slug,
      },
    });

  const mapRole = (role) =>
    toResult({
      type: "role",
      title: role.name,
      subtitle: role.project?.name || "Project role",
      path: buildProjectRolesPath(workspace.slug, role.project.slug),
      meta: {
        workspaceSlug: workspace.slug,
        projectSlug: role.project.slug,
        projectName: role.project?.name || "",
        roleId: role._id,
      },
    });

  const mapTask = (task) =>
    toResult({
      type: "task",
      title: task.title,
      subtitle: task.projectId?.name || "Task",
      path: buildProjectTaskPath(workspace.slug, task.projectId.slug, task._id),
      meta: {
        workspaceSlug: workspace.slug,
        projectSlug: task.projectId.slug,
        projectName: task.projectId?.name || "",
        taskId: task._id,
      },
    });

  const mapWorkflow = (workflow) =>
    toResult({
      type: "workflow",
      title: workflow.name,
      subtitle: workflow.projectId?.name || `V${workflow.version || 1}`,
      path: buildProjectWorkflowPath(
        workspace.slug,
        workflow.projectId.slug,
        workflow._id
      ),
      meta: {
        workspaceSlug: workspace.slug,
        projectSlug: workflow.projectId.slug,
        projectName: workflow.projectId?.name || "",
        workflowId: workflow._id,
        version: workflow.version || 1,
      },
    });

  const [recentRoles, recentTasks, recentWorkflows] = await Promise.all([
    ProjectRole.find({
      project: { $in: projectIds },
    })
      .populate("project", "name slug")
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean(),
    Task.find({
      projectId: { $in: projectIds },
    })
      .populate("projectId", "name slug")
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean(),
    WorkflowTemplate.find({
      projectId: { $in: projectIds },
    })
      .populate("projectId", "name slug")
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean(),
  ]);

  const matchingProjects = projects
    .filter((project) =>
      regex ? isMatch(project.name, regex) || isMatch(project.description, regex) : true
    )
    .slice(0, 8)
    .map(mapProject);

  const [matchingRoles, matchingTasks, matchingWorkflows] = await Promise.all([
    ProjectRole.find({
      project: { $in: projectIds },
      ...(regex ? { name: regex } : {}),
    })
      .populate("project", "name slug")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean(),
    Task.find({
      projectId: { $in: projectIds },
      ...(regex
        ? {
            $or: [{ title: regex }, { description: regex }],
          }
        : {}),
    })
      .populate("projectId", "name slug")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean(),
    WorkflowTemplate.find({
      projectId: { $in: projectIds },
      ...(regex
        ? {
            $or: [{ name: regex }, { description: regex }],
          }
        : {}),
    })
      .populate("projectId", "name slug")
      .sort({ updatedAt: -1 })
      .limit(8)
      .lean(),
  ]);

  const roleResults = matchingRoles
    .filter((role) => role.project?.slug)
    .map(mapRole);

  const taskResults = matchingTasks
    .filter((task) => task.projectId?.slug)
    .map(mapTask);

  const workflowResults = matchingWorkflows
    .filter((workflow) => workflow.projectId?.slug)
    .map(mapWorkflow);

  const featured = [
    ...projects.slice(0, 3).map(mapProject),
    ...recentRoles.filter((role) => role.project?.slug).map(mapRole),
    ...recentTasks.filter((task) => task.projectId?.slug).map(mapTask),
    ...recentWorkflows.filter((workflow) => workflow.projectId?.slug).map(mapWorkflow),
  ];

  return {
    workspace: {
      _id: workspace._id,
      name: workspace.name,
      slug: workspace.slug,
    },
    query: searchTerm,
    featured,
    results: {
      projects: matchingProjects,
      projectRoles: roleResults,
      tasks: taskResults,
      workflows: workflowResults,
    },
  };
};

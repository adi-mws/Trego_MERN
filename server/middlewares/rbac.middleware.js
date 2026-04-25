import { WorkspaceMember } from "../features/workspaces/workspaceMember.model.js";
import { ProjectMember } from "../features/projects/projectMember.model.js";
import { Project } from "../features/projects/project.model.js";
import { Task } from "../features/tasks/task.model.js";

const ADMIN_ROLES = ["OWNER", "ADMIN"];

// ─── Attach workspace role to req ─────────────────────────────────────────────
// Usage: router.use(attachWorkspaceRole)  — must have workspaceId or workspaceSlug available via middleware
export const attachWorkspaceMembership = (getWorkspaceId) => async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const workspaceId = await getWorkspaceId(req);
    if (!workspaceId) return next(); // some routes may not require workspace context

    const membership = await WorkspaceMember.findOne({ workspaceId, userId }).lean();
    req.workspaceMembership = membership || null;
    req.workspaceId = workspaceId;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Require workspace membership ─────────────────────────────────────────────
export const requireWorkspaceMember = async (req, res, next) => {
  if (!req.workspaceMembership) {
    return res.status(403).json({ success: false, message: "Not a member of this workspace" });
  }
  next();
};

// ─── Require workspace admin / owner ──────────────────────────────────────────
export const requireWorkspaceAdmin = async (req, res, next) => {
  const role = req.workspaceMembership?.role;
  if (!ADMIN_ROLES.includes(role)) {
    return res.status(403).json({ success: false, message: "Admin access required" });
  }
  next();
};

// ─── isWorkspaceAdmin helper (non-middleware) ─────────────────────────────────
export const isWorkspaceAdmin = (membership) => {
  return ADMIN_ROLES.includes(membership?.role);
};

// ─── Attach project membership (used in project/task routes) ──────────────────
export const attachProjectMembership = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const { projectId, projectSlug } = req.params;

    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    let resolvedProjectId = projectId;

    if (!resolvedProjectId && projectSlug) {
      const project = await Project.findOne({ slug: projectSlug }).lean();
      resolvedProjectId = project?._id;
    }

    if (!resolvedProjectId) return next();

    req.resolvedProjectId = resolvedProjectId;

    const projectMembership = await ProjectMember.findOne({
      project: resolvedProjectId,
      user: userId,
    }).lean();

    req.projectMembership = projectMembership || null;
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Require project membership (or workspace admin) ──────────────────────────
export const requireProjectAccess = async (req, res, next) => {
  const wsRole = req.workspaceMembership?.role;

  // Workspace admins bypass project membership check
  if (ADMIN_ROLES.includes(wsRole)) return next();

  if (!req.projectMembership) {
    return res.status(403).json({ success: false, message: "You are not a member of this project" });
  }

  next();
};

// ─── Task visibility filter injected into req ─────────────────────────────────
// For members: only tasks assigned to them
// For admins: all tasks
export const injectTaskFilter = async (req, res, next) => {
  try {
    const wsRole = req.workspaceMembership?.role;

    if (ADMIN_ROLES.includes(wsRole)) {
      req.taskFilter = { scope: "all" };
    } else if (String(wsRole || "").toUpperCase() === "MEMBER") {
      req.taskFilter = { scope: "member" };
    } else {
      req.taskFilter = { scope: "none" };
    }

    req.isWorkspaceAdmin = ADMIN_ROLES.includes(wsRole);
    next();
  } catch (err) {
    next(err);
  }
};

// ─── Guard: admin bypass, otherwise require project membership ────────────────
export const guardTaskAdvance = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const wsRole = req.workspaceMembership?.role;

    // Admins bypass
    if (ADMIN_ROLES.includes(wsRole)) return next();

    const task = await Task.findById(taskId).select("projectId currentStageId").lean();
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const userId = req.user?.userId;
    const projectMember = await ProjectMember.findOne({
      project: task.projectId,
      user: userId,
    }).select("_id").lean();

    if (!projectMember) {
      return res.status(403).json({
        success: false,
        message: "Only project members can advance this task",
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

// ─── General workspace context middleware factory ─────────────────────────────
// Looks up workspace by workspaceId param or x-workspace-id header
export const resolveWorkspaceFromParam = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    // Try to get workspaceId from various sources
    const workspaceId =
      req.params.workspaceId ||
      req.headers["x-workspace-id"] ||
      req.body?.workspaceId ||
      req.query?.workspaceId;

    if (!workspaceId || !userId) return next();

    const membership = await WorkspaceMember.findOne({ workspaceId, userId }).lean();
    req.workspaceMembership = membership || null;
    req.workspaceId = workspaceId;
    req.isWorkspaceAdmin = ADMIN_ROLES.includes(membership?.role);
    next();
  } catch (err) {
    next(err);
  }
};

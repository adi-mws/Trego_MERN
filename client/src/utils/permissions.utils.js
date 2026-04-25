/**
 * Trego RBAC Permission Utilities
 * Centralized, reusable permission checks for all frontend components.
 */

const ADMIN_ROLES = ["OWNER", "ADMIN"];
const PROJECT_PERMISSION_DEFAULTS = {
  canManageProject: false,
  canManageMembers: false,
  canInviteMembers: false,
  canCreateTask: false,
  canEditTask: false,
  canDeleteTask: false,
  canViewActivity: false,
};

// ─── Workspace Role Helpers ───────────────────────────────────────────────────

/**
 * Returns true if the workspace role is admin or owner
 */
export function isAdmin(workspaceRole) {
  return ADMIN_ROLES.includes(String(workspaceRole || "").toUpperCase());
}

/**
 * Returns true if the workspace role is exactly MEMBER
 */
export function isMember(workspaceRole) {
  return String(workspaceRole || "").toUpperCase() === "MEMBER";
}

/**
 * Returns true if the workspace role is CLIENT
 */
export function isClient(workspaceRole) {
  return String(workspaceRole || "").toUpperCase() === "CLIENT";
}

export function getProjectPermissions(project) {
  return {
    ...PROJECT_PERMISSION_DEFAULTS,
    ...(project?.permissions || {}),
  };
}

export function canViewProjectActivity(project) {
  return Boolean(getProjectPermissions(project).canViewActivity);
}

export function isClientProjectRole(project) {
  const roleNames = Array.isArray(project?.currentUserRoleNames)
    ? project.currentUserRoleNames
    : [];

  return roleNames.some(
    (roleName) => String(roleName || "").trim().toLowerCase() === "project client"
  );
}

export function canManageProject(project) {
  return Boolean(getProjectPermissions(project).canManageProject);
}

export function canManageProjectMembers(project) {
  const permissions = getProjectPermissions(project);
  return Boolean(permissions.canManageMembers || permissions.canManageProject);
}

export function canInviteProjectMembers(project) {
  const permissions = getProjectPermissions(project);
  return Boolean(permissions.canInviteMembers || permissions.canManageProject);
}

export function canCreateProjectTask(project) {
  return Boolean(getProjectPermissions(project).canCreateTask);
}

export function canEditProjectTask(project) {
  return Boolean(getProjectPermissions(project).canEditTask);
}

export function canDeleteProjectTask(project) {
  return Boolean(getProjectPermissions(project).canDeleteTask);
}

function getTaskAssigneeEntries(task) {
  if (Array.isArray(task?.stageAssignments)) {
    return task.stageAssignments.flatMap((entry) => entry?.assignees || []);
  }

  if (Array.isArray(task?.stageAssignees)) {
    return task.stageAssignees;
  }

  return task?.assignees || [];
}

function getAssigneeUserId(entry) {
  return (
    entry?.projectMemberId?.user?._id ||
    entry?.projectMemberId?.user?.id ||
    entry?.projectMemberId?.user ||
    entry?.user?._id ||
    entry?.user?.id ||
    entry?.user ||
    entry?._id ||
    entry?.id ||
    entry
  );
}

// ─── Project Access ───────────────────────────────────────────────────────────

/**
 * Whether the current user can view a project.
 * Admins can view all. Members must be in projectMemberships.
 * @param {string} workspaceRole
 * @param {string} projectId
 * @param {Array}  projectMemberships - array of {project: {_id}} or raw project ids the user is member of
 */
export function canViewProject(workspaceRole, projectId, projectMemberships = []) {
  if (isAdmin(workspaceRole)) return true;
  return projectMemberships.some((pm) => {
    const id = pm?.project?._id || pm?.project || pm?._id || pm;
    return String(id) === String(projectId);
  });
}

// ─── Task Access ──────────────────────────────────────────────────────────────

/**
 * Whether the current user can view a task.
 * Admins see all. Members only see tasks they are assigned to.
 * @param {string} workspaceRole
 * @param {object} task - task object with assignees array (user ids or populated users)
 * @param {string} currentUserId
 */
export function canViewTask(workspaceRole, task, currentUserId) {
  if (isAdmin(workspaceRole)) return true;
  const assignees = getTaskAssigneeEntries(task);
  return assignees.some((a) => String(getAssigneeUserId(a)) === String(currentUserId));
}

/**
 * Whether the current user can advance a task's workflow.
 * Admins always can. Members can only if they are assigned AND task has assignees.
 */
export function canAdvanceTask(workspaceRole, task, currentUserId) {
  if (isAdmin(workspaceRole)) return true;
  if (getTaskAssigneeEntries(task).length === 0) return false;
  return canViewTask(workspaceRole, task, currentUserId);
}

// ─── UI Feature Visibility ────────────────────────────────────────────────────

/**
 * Whether the user can see the Kanban Board view
 */
export function canViewKanban(workspaceRole) {
  return isAdmin(workspaceRole) || isMember(workspaceRole);
}

/**
 * Whether the user can see the Gantt / Timeline view
 */
export function canViewTimeline(workspaceRole) {
  return isAdmin(workspaceRole) || isMember(workspaceRole);
}

/**
 * Whether the user can see the full project task list
 */
export function canViewAllTasks(workspaceRole) {
  return isAdmin(workspaceRole);
}

/**
 * Whether the user can see the Trego Agent option
 */
export function canAccessAgent(workspaceRole) {
  return isAdmin(workspaceRole);
}

/**
 * Whether the user can create/manage projects
 */
export function canManageProjects(workspaceRole) {
  return isAdmin(workspaceRole);
}

/**
 * Whether the user can invite members to workspace
 */
export function canInviteMembers(workspaceRole) {
  return isAdmin(workspaceRole);
}

/**
 * Whether the user can assign members to tasks
 */
export function canAssignTaskMembers(workspaceRole) {
  return isAdmin(workspaceRole);
}

/**
 * Whether a task is blocked (no assignees) and the user is not admin
 * Admins can always advance; non-admins are blocked if no one is assigned.
 */
export function isTaskBlockedForNonAdmin(workspaceRole, task) {
  if (isAdmin(workspaceRole)) return false;
  return getTaskAssigneeEntries(task).length === 0;
}

export const PROJECT_CLIENT_ROLE_NAME = "Project Client";

export const PROJECT_SYSTEM_ROLE_NAMES = [
  "Head Management",
  "Project Manager",
  PROJECT_CLIENT_ROLE_NAME,
];

export const PROJECT_CLIENT_ROLE_PERMISSIONS = {
  canManageProject: false,
  canManageMembers: false,
  canInviteMembers: false,
  canCreateTask: false,
  canEditTask: false,
  canDeleteTask: false,
  canViewActivity: true,
};

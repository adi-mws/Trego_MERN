export function getEntityId(entity) {
  if (!entity) return null;
  if (typeof entity === "object") {
    return entity._id || entity.id || null;
  }
  return entity;
}

export function resolveWorkspaceRole(workspace, authUser) {
  const directRole =
    workspace?.role ||
    workspace?.currentUserRole ||
    workspace?.currentWorkspace?.currentUserRole ||
    workspace?.currentWorkspace?.role ||
    "";

  if (directRole) {
    return String(directRole).toUpperCase();
  }

  const currentUserId = getEntityId(authUser);
  if (!currentUserId) {
    return "";
  }

  const members = Array.isArray(workspace?.members) ? workspace.members : [];
  const member = members.find((entry) => {
    const candidate =
      entry?.user?._id ||
      entry?.user?.id ||
      entry?.userId?._id ||
      entry?.userId?.id ||
      entry?.userId ||
      entry?.user?._id ||
      entry?._id;

    return String(candidate) === String(currentUserId);
  });

  return String(member?.role || member?.workspaceRole || member?.currentRole || "").toUpperCase();
}

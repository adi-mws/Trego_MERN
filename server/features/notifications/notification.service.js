import Notification from "./notification.model.js";
import NotificationRecipient from "./notificationRecipient.model.js";
import { Session } from "../session/session.model.js";
import { WorkspaceMember } from "../workspaces/workspaceMember.model.js";
import { emitToUser, emitToUserExceptSession } from "../../socket/index.js";

function getDeviceLabel(deviceInfo = {}) {
  const pieces = [deviceInfo.browser, deviceInfo.os, deviceInfo.ip].filter(Boolean);
  return pieces.length > 0 ? pieces.join(" - ") : "another device";
}

function normalizeNotification(notificationDoc, recipientDoc) {
  if (!notificationDoc) return null;

  const triggeredBy = notificationDoc.triggeredBy
    ? {
        _id: notificationDoc.triggeredBy._id || notificationDoc.triggeredBy.id,
        name: notificationDoc.triggeredBy.name,
        email: notificationDoc.triggeredBy.email,
        avatar: notificationDoc.triggeredBy.avatar,
      }
    : null;

  return {
    _id: notificationDoc._id,
    title: notificationDoc.title,
    message: notificationDoc.message,
    toastMessage: notificationDoc.toastMessage || notificationDoc.message,
    image: notificationDoc.image || "",
    type: notificationDoc.type,
    iconKey: notificationDoc.iconKey || "INFO",
    important: notificationDoc.important || false,
    triggeredByType: notificationDoc.triggeredByType,
    triggeredBy,
    scopeType: notificationDoc.scopeType,
    scopeId: notificationDoc.scopeId,
    workspaceId: notificationDoc.workspaceId || null,
    workspaceName: notificationDoc.workspaceName || "",
    workspaceSlug: notificationDoc.workspaceSlug || "",
    projectId: notificationDoc.projectId || null,
    projectName: notificationDoc.projectName || "",
    projectSlug: notificationDoc.projectSlug || "",
    entityType: notificationDoc.entityType || null,
    entityId: notificationDoc.entityId || null,
    link: notificationDoc.link || "",
    sourceSessionId: notificationDoc.sourceSessionId || null,
    createdAt: notificationDoc.createdAt,
    updatedAt: notificationDoc.updatedAt,
    isRead: Boolean(recipientDoc?.isRead),
    isCleared: Boolean(recipientDoc?.isCleared),
    readAt: recipientDoc?.readAt || null,
    clearedAt: recipientDoc?.clearedAt || null,
    recipientId: recipientDoc?._id || null,
  };
}

async function getActiveSessionsByUserIds(userIds = []) {
  const normalizedUserIds = [...new Set(userIds.map((id) => String(id)).filter(Boolean))];

  if (normalizedUserIds.length === 0) {
    return [];
  }

  return await Session.find({
    userId: { $in: normalizedUserIds },
    status: "ACTIVE",
  })
    .select("_id userId")
    .lean();
}

async function createNotificationForSessions({
  title,
  message,
  toastMessage,
  type = "INFO",
  iconKey = "INFO",
  important = false,
  triggeredByType = "SYSTEM",
  triggeredBy = null,
  scopeType,
  scopeId,
  workspaceId = null,
  workspaceName = "",
  workspaceSlug = "",
  projectId = null,
  projectName = "",
  projectSlug = "",
  entityType = null,
  entityId = null,
  link = "",
  sourceSessionId = null,
  recipientSessions = [],
}) {
  const uniqueRecipients = recipientSessions
    .map((recipient) => ({
      userId: String(recipient.userId || ""),
      sessionId: String(recipient.sessionId || ""),
    }))
    .filter((recipient) => recipient.userId && recipient.sessionId)
    .filter((recipient) => String(recipient.sessionId) !== String(sourceSessionId));

  if (!scopeType || !scopeId || uniqueRecipients.length === 0) {
    return null;
  }

  const notification = await Notification.create({
    title,
    message,
    toastMessage: toastMessage || message,
    type,
    iconKey,
    important,
    triggeredByType,
    triggeredBy,
    scopeType,
    scopeId,
    workspaceId,
    workspaceName,
    workspaceSlug,
    projectId,
    projectName,
    projectSlug,
    entityType,
    entityId,
    link,
    sourceSessionId,
  });

  await NotificationRecipient.insertMany(
    uniqueRecipients.map((recipient) => ({
      notificationId: notification._id,
      userId: recipient.userId,
      sessionId: recipient.sessionId,
    }))
  );

  const populated = await Notification.findById(notification._id)
    .populate("triggeredBy", "name email avatar")
    .lean();

  const payload = normalizeNotification(populated);

  const emittedUsers = new Set();
  for (const recipient of uniqueRecipients) {
    if (emittedUsers.has(recipient.userId)) continue;
    emittedUsers.add(recipient.userId);
    emitToUser(recipient.userId, "notification:new", payload);
  }

  return payload;
}

export async function createWorkspaceCreationNotification({
  workspace,
  userId,
  sourceSessionId,
}) {
  if (!workspace?._id || !userId) {
    return null;
  }

  const otherSessions = await Session.find({
    userId,
    status: "ACTIVE",
    _id: { $ne: sourceSessionId },
  })
    .select("_id userId")
    .lean();

  const recipients = otherSessions.map((session) => ({
    userId: String(userId),
    sessionId: String(session._id),
  }));

  return await createNotificationForSessions({
    title: "Workspace created",
    message: `${workspace.name} was created successfully.`,
    toastMessage: `${workspace.name} was created successfully.`,
    type: "SYSTEM",
    iconKey: "PROJECT",
    important: true,
    triggeredByType: "USER",
    triggeredBy: userId,
    scopeType: "WORKSPACE",
    scopeId: workspace._id,
    workspaceId: workspace._id,
    workspaceName: workspace.name,
    workspaceSlug: workspace.slug,
    entityType: "WORKSPACE",
    entityId: workspace._id,
    link: `/app/${workspace.slug}`,
    sourceSessionId,
    recipientSessions: recipients,
  });
}

export async function createProjectCreationNotification({
  project,
  workspace,
  userId,
  sourceSessionId,
}) {
  if (!project?._id || !workspace?._id || !userId) {
    return null;
  }

  const projectData =
    typeof project.toObject === "function" ? project.toObject() : project;
  const workspaceData =
    typeof workspace.toObject === "function" ? workspace.toObject() : workspace;

  const workspaceMemberIds = await WorkspaceMember.distinct("userId", {
    workspaceId: workspaceData._id,
    role: { $in: ["OWNER", "ADMIN"] },
  });

  const activeSessions = await getActiveSessionsByUserIds(workspaceMemberIds);
  const recipientSessions = activeSessions.map((session) => ({
    userId: String(session.userId),
    sessionId: String(session._id),
  }));

  const payload = await createNotificationForSessions({
    title: "Project created",
    message: `${projectData.name} was created in ${workspaceData.name}.`,
    toastMessage: `${projectData.name} was created in ${workspaceData.name}.`,
    type: "ACTION",
    iconKey: "PROJECT",
    important: true,
    triggeredByType: "USER",
    triggeredBy: userId,
    scopeType: "WORKSPACE",
    scopeId: workspaceData._id,
    workspaceId: workspaceData._id,
    workspaceName: workspaceData.name,
    workspaceSlug: workspaceData.slug,
    projectId: projectData._id,
    projectName: projectData.name,
    projectSlug: projectData.slug,
    entityType: "PROJECT",
    entityId: projectData._id,
    link: `/app/${workspaceData.slug}/projects/${projectData.slug}`,
    sourceSessionId,
    recipientSessions,
  });

  if (payload) {
    const eventPayload = {
      project: {
        ...projectData,
        workspace: workspaceData._id,
        workspaceId: workspaceData._id,
        workspaceSlug: workspaceData.slug,
        workspaceName: workspaceData.name,
      },
      workspace: {
        _id: workspaceData._id,
        name: workspaceData.name,
        slug: workspaceData.slug,
      },
      sourceSessionId,
      notification: payload,
    };

    const emittedUsers = new Set();
    for (const recipient of recipientSessions) {
      if (emittedUsers.has(recipient.userId)) continue;
      emittedUsers.add(recipient.userId);
      emitToUser(recipient.userId, "workspace:project-created", eventPayload);
    }
  }

  return payload;
}

export async function createProjectMemberAddedNotification({
  project,
  workspace,
  userId,
  targetUserId,
  sourceSessionId,
}) {
  if (!project?._id || !workspace?._id || !userId || !targetUserId) {
    return null;
  }

  const projectData =
    typeof project.toObject === "function" ? project.toObject() : project;
  const workspaceData =
    typeof workspace.toObject === "function" ? workspace.toObject() : workspace;

  const workspaceMemberIds = await WorkspaceMember.distinct("userId", {
    workspaceId: workspaceData._id,
    role: { $in: ["OWNER", "ADMIN"] },
  });

  const activeSessions = await getActiveSessionsByUserIds([
    ...workspaceMemberIds,
    targetUserId,
  ]);

  const recipientSessions = activeSessions.map((session) => ({
    userId: String(session.userId),
    sessionId: String(session._id),
  }));

  const payload = await createNotificationForSessions({
    title: "Project member added",
    message: `A member was added to ${projectData.name} in ${workspaceData.name}.`,
    toastMessage: `${projectData.name} was updated with a new member.`,
    type: "ACTION",
    iconKey: "PROJECT",
    important: true,
    triggeredByType: "USER",
    triggeredBy: userId,
    scopeType: "WORKSPACE",
    scopeId: workspaceData._id,
    workspaceId: workspaceData._id,
    workspaceName: workspaceData.name,
    workspaceSlug: workspaceData.slug,
    projectId: projectData._id,
    projectName: projectData.name,
    projectSlug: projectData.slug,
    entityType: "PROJECT_MEMBER",
    entityId: targetUserId,
    link: `/app/${workspaceData.slug}/projects/${projectData.slug}/members`,
    sourceSessionId,
    recipientSessions,
  });

  if (payload) {
    const eventPayload = {
      project: {
        ...projectData,
        workspace: workspaceData._id,
        workspaceId: workspaceData._id,
        workspaceSlug: workspaceData.slug,
        workspaceName: workspaceData.name,
      },
      workspace: {
        _id: workspaceData._id,
        name: workspaceData.name,
        slug: workspaceData.slug,
      },
      targetUserId: String(targetUserId),
      sourceSessionId,
      notification: payload,
    };

    const emittedUsers = new Set();
    for (const recipient of recipientSessions) {
      if (emittedUsers.has(recipient.userId)) continue;
      emittedUsers.add(recipient.userId);
      emitToUser(recipient.userId, "workspace:project-member-added", eventPayload);
    }
  }

  return payload;
}

export async function createProjectMemberRemovedNotification({
  project,
  workspace,
  userId,
  sourceSessionId,
}) {
  if (!project?._id || !workspace?._id || !userId) {
    return null;
  }

  const projectData =
    typeof project.toObject === "function" ? project.toObject() : project;
  const workspaceData =
    typeof workspace.toObject === "function" ? workspace.toObject() : workspace;

  const workspaceMemberIds = await WorkspaceMember.distinct("userId", {
    workspaceId: workspaceData._id,
    role: { $in: ["OWNER", "ADMIN"] },
  });

  const activeSessions = await getActiveSessionsByUserIds(workspaceMemberIds);
  const recipientSessions = activeSessions.map((session) => ({
    userId: String(session.userId),
    sessionId: String(session._id),
  }));

  return await createNotificationForSessions({
    title: "Project member removed",
    message: `${projectData.name} no longer has one of its members.`,
    toastMessage: `${projectData.name} membership was updated.`,
    type: "ACTION",
    iconKey: "PROJECT",
    important: true,
    triggeredByType: "USER",
    triggeredBy: userId,
    scopeType: "WORKSPACE",
    scopeId: workspaceData._id,
    workspaceId: workspaceData._id,
    workspaceName: workspaceData.name,
    workspaceSlug: workspaceData.slug,
    projectId: projectData._id,
    projectName: projectData.name,
    projectSlug: projectData.slug,
    entityType: "PROJECT_MEMBER",
    entityId: projectData._id,
    link: `/app/${workspaceData.slug}/projects/${projectData.slug}/members`,
    sourceSessionId,
    recipientSessions,
  });
}

export async function createSessionActivityNotification({
  userId,
  sourceSessionId,
  recipientSessionIds = [],
  action,
  deviceInfo = {},
}) {
  const targets = [...new Set(recipientSessionIds.map((id) => String(id)).filter(Boolean))].filter(
    (id) => String(id) !== String(sourceSessionId)
  );

  if (!userId || !sourceSessionId || targets.length === 0) {
    return null;
  }

  const isLogin = String(action).toUpperCase() === "LOGIN";
  const deviceLabel = getDeviceLabel(deviceInfo);
  const title = isLogin ? "Signed in on another device" : "Signed out on another device";
  const message = isLogin
    ? `A new sign-in was detected from ${deviceLabel}.`
    : `A sign-out was detected from ${deviceLabel}.`;

  const notification = await Notification.create({
    title,
    message,
    toastMessage: message,
    type: "SYSTEM",
    iconKey: isLogin ? "LOGIN" : "LOGOUT",
    important: true,
    triggeredByType: "USER",
    triggeredBy: userId,
    scopeType: "ACCOUNT",
    scopeId: userId,
    entityType: "ACCOUNT",
    entityId: userId,
    link: "/app/notifications",
    sourceSessionId,
  });

  await NotificationRecipient.insertMany(
    targets.map((sessionId) => ({
      notificationId: notification._id,
      userId,
      sessionId,
    }))
  );

  const populated = await Notification.findById(notification._id)
    .populate("triggeredBy", "name email avatar")
    .lean();

  const payload = normalizeNotification(populated);
  emitToUserExceptSession(userId, sourceSessionId, "notification:new", payload);
  return payload;
}

export async function getNotificationsForSession({ userId, sessionId, limit = 50 }) {
  if (!userId || !sessionId) {
    return { notifications: [], unreadCount: 0 };
  }

  const recipients = await NotificationRecipient.find({
    userId,
    sessionId,
    isCleared: false,
  })
    .populate({
      path: "notificationId",
      populate: {
        path: "triggeredBy",
        select: "name email avatar",
      },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const notifications = recipients
    .map((recipient) => normalizeNotification(recipient.notificationId, recipient))
    .filter(Boolean);

  const unreadCount = recipients.filter((recipient) => !recipient.isRead).length;

  return { notifications, unreadCount };
}

export async function markNotificationRead({ userId, sessionId, notificationId }) {
  const recipient = await NotificationRecipient.findOneAndUpdate(
    { userId, sessionId, notificationId, isCleared: false },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  )
    .populate({
      path: "notificationId",
      populate: { path: "triggeredBy", select: "name email avatar" },
    })
    .lean();

  return recipient ? normalizeNotification(recipient.notificationId, recipient) : null;
}

export async function markAllNotificationsRead({ userId, sessionId }) {
  if (!userId || !sessionId) {
    return { modifiedCount: 0 };
  }

  const result = await NotificationRecipient.updateMany(
    { userId, sessionId, isCleared: false, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  return { modifiedCount: result.modifiedCount || 0 };
}

export async function clearNotificationForSession({ userId, sessionId, notificationId }) {
  const recipient = await NotificationRecipient.findOneAndUpdate(
    { userId, sessionId, notificationId },
    { $set: { isCleared: true, clearedAt: new Date() } },
    { new: true }
  )
    .populate({
      path: "notificationId",
      populate: { path: "triggeredBy", select: "name email avatar" },
    })
    .lean();

  return recipient ? normalizeNotification(recipient.notificationId, recipient) : null;
}

export async function clearAllNotificationsForSession({ userId, sessionId }) {
  if (!userId || !sessionId) {
    return { clearedCount: 0 };
  }

  const result = await NotificationRecipient.updateMany(
    { userId, sessionId, isCleared: false },
    { $set: { isCleared: true, clearedAt: new Date() } }
  );

  return { clearedCount: result.modifiedCount || 0 };
}

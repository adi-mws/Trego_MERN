// services/notification.service.js
import Notification from "../models/Notification.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
import { socketStore } from "../socket/store.js";
import { emitToAdmin, emitToRoom, getIO } from "../socket/index.js";
import { getLocalFileUrl } from "../utils/fileUtils.js";

/**
 * Create a created notification and broadcast it to eligible recipients
 */
export async function createNotification({
    title,
    message,
    toastMessage,
    image = null,
    type,
    important = false,
    triggeredByType,
    triggeredById,
    targets,
    link = null,
    readBy = [],
    clearedBy = [],

}, req = null) {
    if (triggeredByType === 'user' && triggeredById) {
        const user = await User.findById(triggeredById).lean()
        image = user.profilePic;
    }
    else if (triggeredByType === 'admin' && triggeredById) {
        const admin = await Admin.findById(triggeredById).lean();
        image = admin.profilePic;
        console.log("Reached the admin place", admin.profilePic);
    }
    // 1. Create notification document
    const notification = await Notification.create({
        title,
        message,
        toastMessage: toastMessage || message,
        image,
        type,
        important,
        triggeredByType,
        triggeredById: triggeredByType === "system" ? null : triggeredById,
        targets,
        link,
        clearedBy: clearedBy || [],
        readBy: readBy || [],
    });

    // 2. Prepare the socket payload (only safe fields)
    const payload = {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        toastMessage: notification.toastMessage,
        image: notification.image && req ? getLocalFileUrl(req, notification.image) : null,
        type: notification.type,
        link: notification.link,
        read: false,
        important: notification.important,
        createdAt: notification.createdAt,
    };

    // 3. Emit to actual recipients
    // Don't send to the exceptId 

    // for example... logout should not be shown to the actual person ..who himself does
    if (clearedBy.length == 1) {
        await emitToRecipients(targets, payload, clearedBy[0]);
    }
    else await emitToRecipients(targets, payload)

    return notification;
}


/**
 * Resolve recipients for the notification based on the mode
 */

export async function resolveRecipients(targets) {
    const { mode, ids = [] } = targets;

    switch (mode) {

        case "ALL":
        case "ADMINS":
        case "USERS":
            return [];

        // SPECIFIC → return the list of IDs
        case "SPECIFIC":
            return ids.map(i => i.toString());

        default:
            return [];
    }
}

/**
 * Emit a notification payload to every active session of each recipient
 */
export async function emitToRecipients(targets, payload, exceptId = null) {
    const io = getIO();

    switch (targets.mode) {

        case "ALL":
            emitToRoom("users", "notification:created", payload)
            emitToRoom("admins", "notification:created", payload)
            break;

        case "ADMINS":
            // console.log("emitting to admins", payload)
            if (exceptId)
                emitToRoom("admins", "notification:created", payload, Array.from(socketStore.getAdminAllSockets(exceptId)))
            else
                emitToRoom("admins", "notification:created", payload)

            break;

        case "USERS":
            emitToRoom("users", "notification:created", payload)
            break;

        case "SPECIFIC": {
            const ids = targets.ids.map(id => id.toString());

            // 1. Fetch whether each id belongs to admin or user
            const admins = await Admin.find({ _id: { $in: ids } }).select("_id");
            const users = await User.find({ _id: { $in: ids } }).select("_id");

            const adminIds = admins.map(a => a._id.toString());
            const userIds = users.map(u => u._id.toString());

            // 2. Emit separately
            adminIds.forEach(adminId => {
                if (adminId !== exceptId) io.to(`admin:${adminId}`).emit("notification:created", payload);
            });

            userIds.forEach(userId => {
                if (userId !== exceptId) io.to(`user:${userId}`).emit("notification:created", payload);
            });
            break;
        }
    }
}


/**
 * Mark notification as read
 */
export async function markAsRead(notificationIds, userId) {
    // Ensure we have an array
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];
    // console.log(ids)
    // Update all notifications in one operation
    const result = await Notification.updateMany(
        { _id: { $in: ids } },
        { $addToSet: { readBy: userId } }
    );
    // TODO: check for the userId or admin Id then send 
    emitToAdmin(userId, "notification:mark-read");
    return result; // returns { acknowledged, modifiedCount, ... }
}
/**
 * Mark notification as mounted
 */
export async function markAsCleared(notificationIds, userId) {
    const isMultiple = Array.isArray(notificationIds)
    const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

    await Notification.updateMany(
        { _id: { $in: ids } },
        { $addToSet: { clearedBy: userId } }
    );

    const updatedNotifications = await Notification.find({ _id: { $in: ids } }).lean();
    // TODO: check for the userId or admin Id then send 
    if (isMultiple) {
        emitToAdmin(userId, "notification:clear-all");
    } else emitToAdmin(userId, "notification:clear", { notificationId: ids[0] });
    return {
        success: true,
        updatedNotifications: updatedNotifications.map(n => ({
            ...n,
            read: n.readBy.includes(userId)
        }))
    }
}


// HELPERS
// todo: helpers are not used
function isUserEligible(notification, userId) {
    return (
        !notification.clearedBy.includes(userId) // not completed
    );
}

function isUnread(notification, userId) {
    return (
        !notification.readBy.includes(userId) &&
        !notification.clearedBy.includes(userId)
    );
}

// GET: Fetch All Notifications For a User
export async function getNotificationsForUser(userId, userType, userSettings = {}) {
    const notifications = await Notification.find({
        $or: [
            { "targets.mode": "ALL" },
            userType === "admin" && { "targets.mode": "ADMINS" },
            userType === "user" && { "targets.mode": "USERS" },
            {
                "targets.mode": "SPECIFIC",
                "targets.ids": userId
            }
        ].filter(Boolean)
    })
        .sort({ createdAt: -1 })
        .lean();

    // Filter out notifications that the user has cleared
    let visibleNotifications = notifications.filter(
        n => !n.clearedBy?.map(id => id.toString()).includes(userId.toString())
    );

    // console.log(visibleNotifications);
    // For admins, filter by important setting
    if (userType === "admin" && userSettings.showImportantNotificationsOnly) {
        visibleNotifications = visibleNotifications.filter(n => n.important);
    }

    // Map the notifications with isRead flag
    const mappedNotifications = visibleNotifications.map(n => {
        const readByStrings = n.readBy.map(id => id.toString());

        return {
            ...n,
            read: readByStrings.includes(userId.toString()),
        };
    });


    // Count unread notifications
    const unreadCount = mappedNotifications.filter(n => !n.read).length;

    return {
        unreadCount,
        notificationsList: mappedNotifications,

    };
}


// GET: Unread Count for a User
// todo: not useful function
export async function getUnreadCount(userId, userType) {
    const notifications = await Notification.find({
        $or: [
            { "targets.mode": "ALL" },
            userType === "admin" && { "targets.mode": "ADMINS" },
            userType === "user" && { "targets.mode": "USERS" },
            {
                "targets.mode": "SPECIFIC",
                "targets.ids": userId
            }
        ].filter(Boolean)
    })
        .select("readBy clearedBy createdAt targets")
        .lean();

    const unread = notifications.filter(n => isUnread(n, userId));

    return unread.length;
}

// --------------------------------------------------
// GET: Fetch Single Notification and Mark Read
// --------------------------------------------------
// TODO Fix it

export async function getNotificationById(notificationId, userId) {
    const notif = await Notification.findByIdAndUpdate(
        notificationId,
        { $addToSet: { readBy: userId } },
        { created: true }
    ).lean();

    if (!notif) return null;

    return {
        ...notif,
    };
}

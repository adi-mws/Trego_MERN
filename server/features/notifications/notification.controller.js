import {
  getNotificationsForSession,
  markNotificationRead,
  clearNotificationForSession,
  clearAllNotificationsForSession,
  markAllNotificationsRead,
} from "./notification.service.js";

export const getNotifications = async (req, res, next) => {
  try {
    const data = await getNotificationsForSession({
      userId: req.user?.userId,
      sessionId: req.user?.sessionId,
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await markNotificationRead({
      userId: req.user?.userId,
      sessionId: req.user?.sessionId,
      notificationId,
    });

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

export const clearNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const notification = await clearNotificationForSession({
      userId: req.user?.userId,
      sessionId: req.user?.sessionId,
      notificationId,
    });

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

export const clearAllNotifications = async (req, res, next) => {
  try {
    const data = await clearAllNotificationsForSession({
      userId: req.user?.userId,
      sessionId: req.user?.sessionId,
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const data = await markAllNotificationsRead({
      userId: req.user?.userId,
      sessionId: req.user?.sessionId,
    });

    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { callApi } from "../api/api";
import {
  setNotifications as setNotificationsAction,
  addNotification as addNotificationAction,
  markAsRead as markAsReadAction,
  markAllAsRead as markAllAsReadAction,
  clearAllNotifications as clearAllNotificationsAction,
  clearNotification as clearNotificationAction,
  setLoading,
  setError,
} from "../redux/slices/notificationSlice";

export const useNotification = () => {
  const dispatch = useDispatch();

  const { items, unreadCount, loading, error } = useSelector(
    (state) => state.notifications
  );

  const fetchNotifications = useCallback(async () => {
    dispatch(setLoading(true));
    const res = await callApi({ method: "get", url: "/notifications" });

    if (res.success) {
      dispatch(setNotificationsAction(res.data.data));
    } else {
      dispatch(setError(res.error?.message || "Failed to load notifications"));
    }

    return res;
  }, [dispatch]);

  const addNotification = useCallback(
    (data) => dispatch(addNotificationAction(data)),
    [dispatch]
  );

  const markAsRead = useCallback(
    async (id) => {
      const res = await callApi({ method: "patch", url: `/notifications/${id}/read` });
      if (res.success) {
        dispatch(markAsReadAction(id));
      }
      return res;
    },
    [dispatch]
  );

  const markAllAsRead = useCallback(async () => {
    const res = await callApi({ method: "patch", url: "/notifications/read-all" });
    if (res.success) {
      dispatch(markAllAsReadAction());
    }
    return res;
  }, [dispatch]);

  const clearNotification = useCallback(
    async (id) => {
      const res = await callApi({ method: "delete", url: `/notifications/${id}` });
      if (res.success) {
        dispatch(clearNotificationAction(id));
      }
      return res;
    },
    [dispatch]
  );

  const clearAllNotifications = useCallback(async () => {
    const res = await callApi({ method: "delete", url: "/notifications/clear-all" });
    if (res.success) {
      dispatch(clearAllNotificationsAction());
    }
    return res;
  }, [dispatch]);

  return {
    notifications: items,
    unreadCount,
    loading,
    error,

    fetchNotifications,
    setNotifications: (data) => dispatch(setNotificationsAction(data)),
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    setLoading: (val) => dispatch(setLoading(val)),
    setError: (err) => dispatch(setError(err)),
  };
};

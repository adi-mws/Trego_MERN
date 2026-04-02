import { useDispatch, useSelector } from "react-redux";
import { setNotifications, addNotification, markAsRead, 
    clearAllNotifications, clearNotification, setLoading, setError
 } from "../redux/slices/notificationSlice";
export const useNotification = () => {
  const dispatch = useDispatch();

  const { items, unreadCount, loading, error } = useSelector(
    (state) => state.notifications
  );

  return {
    notifications: items,
    unreadCount,
    loading,
    error,

    setNotifications: (data) => dispatch(setNotifications(data)),
    addNotification: (data) => dispatch(addNotification(data)),
    markAsRead: (id) => dispatch(markAsRead(id)),
    clearNotification: (id) => dispatch(clearNotification(id)),
    clearAllNotifications: () => dispatch(clearAllNotifications()),
    setLoading: (val) => dispatch(setLoading(val)),
    setError: (err) => dispatch(setError(err)),
  };
};
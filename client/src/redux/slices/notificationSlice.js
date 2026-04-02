import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notifications",
  initialState,

  reducers: {
    // SET FROM API
    setNotifications: (state, action) => {
      const { notifications, unreadCount } = action.payload;

      state.items = notifications;
      state.unreadCount = unreadCount;
      state.loading = false;
    },

    // ADD NEW (real-time)
    addNotification: (state, action) => {
      const notif = action.payload;

      state.items.unshift(notif);

      if (!notif.isRead) {
        state.unreadCount += 1;
      }
    },

    // MARK AS READ
    markAsRead: (state, action) => {
      const notif = state.items.find(n => n._id === action.payload);

      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // CLEAR SINGLE NOTIFICATION
    clearNotification: (state, action) => {
      const id = action.payload;

      const notif = state.items.find(n => n._id === id);

      if (notif && !notif.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }

      state.items = state.items.filter(n => n._id !== id);
    },

    // CLEAR ALL
    clearAllNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },

    // LOADING / ERROR
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  clearNotification,
  clearAllNotifications,
  setLoading,
  setError,
} = notificationSlice.actions;

export default notificationSlice.reducer;
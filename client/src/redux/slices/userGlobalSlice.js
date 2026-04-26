// store/userGlobalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const userGlobalSlice = createSlice({
  name: "userGlobal",
  initialState,

  reducers: {
    // Set full user (from API)
    setUserGlobal: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Update user fields (partial merge)
    updateUserGlobal: (state, action) => {
      state.user = {
        ...(state.user || {}),
        ...action.payload,
      };
    },
    updateProfile: (state, action) => {
      if (!state.user) return;

      state.user.profile = {
        ...state.user.profile,
        ...action.payload,
      };
    },

    // Update preferences safely
    updatePreferences: (state, action) => {
      if (!state.user) return;

      state.user.preferences = {
        ...state.user.preferences,
        ...action.payload,
      };
    },

    setUserSessions: (state, action) => {
      if (!state.user) return;

      state.user.sessions = Array.isArray(action.payload) ? action.payload : [];
    },

    addUserSession: (state, action) => {
      if (!state.user) return;

      const incoming = action.payload;
      const sessionId = String(incoming?.id || incoming?._id || "");
      if (!sessionId) return;

      const sessions = Array.isArray(state.user.sessions)
        ? [...state.user.sessions]
        : [];

      const normalizedSession = {
        ...incoming,
        id: sessionId,
      };

      const existingIndex = sessions.findIndex((session) =>
        String(session?.id || session?._id) === sessionId
      );

      if (existingIndex >= 0) {
        sessions[existingIndex] = {
          ...sessions[existingIndex],
          ...normalizedSession,
        };
      } else {
        sessions.unshift(normalizedSession);
      }

      state.user.sessions = sessions;
    },

    removeUserSession: (state, action) => {
      if (!state.user?.sessions) return;

      const sessionId = String(action.payload || "");
      if (!sessionId) return;

      state.user.sessions = state.user.sessions.filter((session) =>
        String(session?.id || session?._id) !== sessionId
      );
    },



    // Loading + Error
    setUserLoading: (state, action) => {
      state.loading = action.payload;
    },

    setUserError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Reset (logout)
    resetUserGlobal: () => ({ ...initialState }),
  },
});

export const {
  setUserGlobal,
  updateUserGlobal,
  updateProfile,
  updatePreferences,
  setUserSessions,
  addUserSession,
  removeUserSession,
  setUserLoading,
  setUserError,
  resetUserGlobal,
} = userGlobalSlice.actions;

export default userGlobalSlice.reducer;

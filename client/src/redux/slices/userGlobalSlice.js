// store/userGlobalSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null, // { id, name, email, avatar }

  preferences: {
    theme: {
      mode: "light",
      accentColor: "#1976d2",
    },
  },

  status: "idle", // idle | loading | succeeded | failed
  error: null,
};

const userGlobalSlice = createSlice({
  name: "userGlobal",
  initialState,

  reducers: {
    // 🔹 Set full user data (API response)
    setUserGlobal: (state, action) => {
      const { profile, preferences } = action.payload;

      state.profile = profile || null;

      if (preferences) {
        state.preferences = {
          ...state.preferences,
          ...preferences,
        };
      }
    },

    // 🔹 Update only profile
    updateProfile: (state, action) => {
      state.profile = {
        ...state.profile,
        ...action.payload,
      };
    },

    // 🔹 Update preferences (generic)
    updatePreferences: (state, action) => {
      state.preferences = {
        ...state.preferences,
        ...action.payload,
      };
    },

    // 🔹 Update theme specifically (nested safe update)
    updateThemePreference: (state, action) => {
      state.preferences.theme = {
        ...state.preferences.theme,
        ...action.payload,
      };
    },

    // 🔹 Loading states (for API calls)
    setUserStatus: (state, action) => {
      state.status = action.payload;
    },

    setUserError: (state, action) => {
      state.error = action.payload;
    },

    // 🔹 Reset on logout
    resetUserGlobal: () => initialState,
  },
});

export const {
  setUserGlobal,
  updateProfile,
  updatePreferences,
  updateThemePreference,
  setUserStatus,
  setUserError,
  resetUserGlobal,
} = userGlobalSlice.actions;

export default userGlobalSlice.reducer;
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
      if (!state.user) return;

      state.user = {
        ...state.user,
        ...action.payload,
      };
    },

    // Update preferences safely
    updatePreferences: (state, action) => {
      if (!state.user) return;

      state.user.prefrences = {
        ...state.user.prefrences,
        ...action.payload,
      };
    },

    // Update theme specifically
    updateTheme: (state, action) => {
      if (!state.user) return;

      state.user.prefrences = {
        ...state.user.prefrences,
        ...action.payload,
      };
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
    resetUserGlobal: () => initialState,
  },
});

export const {
  setUserGlobal,
  updateUserGlobal,
  updatePreferences,
  updateTheme,
  setUserLoading,
  setUserError,
  resetUserGlobal,
} = userGlobalSlice.actions;

export default userGlobalSlice.reducer;
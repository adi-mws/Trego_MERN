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
  updateProfile,
  updatePreferences,
  setUserLoading,
  setUserError,
  resetUserGlobal,
} = userGlobalSlice.actions;

export default userGlobalSlice.reducer;
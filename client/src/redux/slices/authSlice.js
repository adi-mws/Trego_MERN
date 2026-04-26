// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  loading: true,
  data: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {

    setAuth(state, action) {
      const { data } = action.payload;
      state.data = data;
      state.isAuthenticated = true;
      state.loading = false;
    },

    logout(state) {
      state.isAuthenticated = false;
      state.data = null;
      state.loading = false;
    },

    setLoading(state, action) {
      state.loading = action.payload;
    },

    updateAuthData(state, action) {
      if (!state.data) return;

      state.data = {
        ...state.data,
        ...action.payload,
      };
    },
  },
});

export const { setAuth, logout, setLoading, updateAuthData } = authSlice.actions;
export default authSlice.reducer;

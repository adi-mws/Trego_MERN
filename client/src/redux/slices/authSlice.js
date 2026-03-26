// alert.slice.js
import { createSlice } from "@reduxjs/toolkit";

const alertSlice = createSlice({
  name: "alerts",
  initialState: {
    list: []
  },

  reducers: {
    showAlert: (state, action) => {
      const { message, severity = "info", id, timeout } = action.payload;
      state.list.push({ id, message, severity, timeout });
    },

    removeAlert: (state, action) => {
      state.list = state.list.filter(a => a.id !== action.payload);
    }
  }
});

export const { showAlert, removeAlert } = alertSlice.actions;
export default alertSlice.reducer;

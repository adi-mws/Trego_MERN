import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  open: false,
  title: "",
  message: "",
};

const confirmSlice = createSlice({
  name: "confirm",
  initialState,
  reducers: {
    showConfirm: (state, action) => {
      state.open = true;
      state.title = action.payload.title;
      state.message = action.payload.message;
    },
    hideConfirm: (state) => {
      state.open = false;
      state.title = "";
      state.message = "";
    },
  },
});

export const { showConfirm, hideConfirm } = confirmSlice.actions;
export default confirmSlice.reducer;

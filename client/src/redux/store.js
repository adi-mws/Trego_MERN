import { configureStore } from "@reduxjs/toolkit";
// import adminGlobalReducer from "./slices/adminGlobalSlice";
import authReducer from "./slices/authSlice";
// import socketReducer from "./slices/socketSlice";
// import userGlobalReducer from "./slices/userGlobalSlice";
import confirmReducer from "./slices/confirmSlice";
import alertReducer from './slices/alertSlice';
export const store = configureStore({
  reducer: {
    auth: authReducer,           // handles role, isAuthenticated, data
    // adminGlobal: adminGlobalReducer,  // admin personalDetails, settings, analytics
    // userGlobal: userGlobalReducer,    // user personalDetails, settings, analytics
    // socket: socketReducer,       // socket connection status, last heartbeat, etc.
    confirm: confirmReducer,      // confirm dialog box for confirm before triggering an action 
    alerts: alertReducer           // alert box to inform through the tost of the event
  }
});

export default store;
// hooks/useUserGlobal.js
import { useDispatch, useSelector } from "react-redux";
import {
  setUserGlobal,
  updateUserGlobal,
  updatePreferences,
  updateTheme,
  setUserLoading,
  setUserError,
  resetUserGlobal,
} from "../store/userGlobalSlice";

export const useUserGlobal = () => {
  const dispatch = useDispatch();

  const { user, loading, error } = useSelector(
    (state) => state.userGlobal
  );

  // Set full user
  const setUser = (data) => {
    dispatch(setUserGlobal(data));
  };

  // Update user (generic)
  const updateUser = (data) => {
    dispatch(updateUserGlobal(data));
  };

  // Preferences
  const updatePrefs = (data) => {
    dispatch(updatePreferences(data));
  };

  const updateThemePref = (data) => {
    dispatch(updateTheme(data));
  };

  // Status
  const setLoading = (val) => {
    dispatch(setUserLoading(val));
  };

  const setError = (err) => {
    dispatch(setUserError(err));
  };

  // Reset
  const reset = () => {
    dispatch(resetUserGlobal());
  };

  return {
    user,
    loading,
    error,
    setUser,
    updateUser,
    updatePrefs,
    updateThemePref,
    setLoading,
    setError,
    reset,
  };
};
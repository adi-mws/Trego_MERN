// hooks/useUserGlobal.js
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setUserGlobal,
    updateUserGlobal,
    updatePreferences,
    updateProfile,
    setUserSessions,
    addUserSession,
    removeUserSession,
    setUserLoading,
    setUserError,
    resetUserGlobal,
} from "../redux/slices/userGlobalSlice";

export const useUserGlobal = () => {
    const dispatch = useDispatch();

    const { user, loading, error } = useSelector(
        (state) => state.userGlobal
    );

    // Set full user
    const setUser = useCallback((data) => {
        dispatch(setUserGlobal(data));
    }, [dispatch]);


    // Update user (generic)
    const updateUser = useCallback((data) => {
        dispatch(updateUserGlobal(data));
    }, [dispatch]);

    // Preferences
    const updatePrefs = useCallback((data) => {
        dispatch(updatePreferences(data));
    }, [dispatch]);

    const updateUserProfile = useCallback((data) => {
        dispatch(updateProfile(data));
    }, [dispatch]);

    const updateSessions = useCallback((sessions) => {
        dispatch(setUserSessions(sessions));
    }, [dispatch]);

    const addSession = useCallback((session) => {
        dispatch(addUserSession(session));
    }, [dispatch]);

    const removeSession = useCallback((sessionId) => {
        dispatch(removeUserSession(sessionId));
    }, [dispatch]);

    // Status
    const setLoading = useCallback((val) => {
        dispatch(setUserLoading(val));
    }, [dispatch]);

    const setError = useCallback((err) => {
        dispatch(setUserError(err));
    }, [dispatch]);

    // Reset
    const reset = useCallback(() => {
        dispatch(resetUserGlobal());
    }, [dispatch]);

    return useMemo(() => ({
        user,
        loading,
        error,
        setUser,
        updateUser,
        updatePrefs,
        updateUserProfile,
        updateSessions,
        addSession,
        removeSession,
        setLoading,
        setError,
        reset,
    }), [
        user,
        loading,
        error,
        setUser,
        updateUser,
        updatePrefs,
        updateUserProfile,
        updateSessions,
        addSession,
        removeSession,
        setLoading,
        setError,
        reset,
    ]);
};

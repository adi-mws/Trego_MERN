// src/hooks/useAuth.js
import { useSelector, useDispatch } from "react-redux";
import { setAuth, logout, setLoading } from "../redux/slices/authSlice";

const useAuth = () => {
  const dispatch = useDispatch();

  // state
  const { isAuthenticated, loading, data } = useSelector(
    (state) => state.auth
  );

  // actions
  const login = (userData) => {
    dispatch(setAuth({ data: userData }));
  };

  const signOut = () => {
    dispatch(logout());
  };

  const setAuthLoading = (value) => {
    dispatch(setLoading(value));
  };

  return {
    isAuthenticated,
    loading,
    user: data,

    // actions
    login,
    logout: signOut,
    setLoading: setAuthLoading,
  };
};

export default useAuth;
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  // Optional: handle loading state (important for refresh cases)
  if (loading) return null; // or a spinner

  return isAuthenticated ? <Outlet /> : <Navigate to="/sign-in" replace />
};

export default ProtectedRoute;
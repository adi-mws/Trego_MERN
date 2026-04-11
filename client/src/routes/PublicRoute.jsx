import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PublicRoute = ({ allowAuthenticated = false }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // If logged in and route is NOT allowed → go to /app
  if (isAuthenticated && !allowAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

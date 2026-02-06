import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../store/hooks";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isAuthInitialized, role, token } = useAuth();
  const location = useLocation();
  //  Wait for auth hydration
  if (!isAuthInitialized) {
    return null;
  }
  // Token exists but auth not updated yet
  if (!isAuthenticated && token) {
    return null;
  }
  //  Role not resolved yet
  if (!role && token) {
    return null;
  }
  //  Truly unauthenticated
  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  // Role-based protection
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

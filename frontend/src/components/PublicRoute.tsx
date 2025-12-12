import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// For pages like /login and /register.
// If already logged in, send user to /menu.
export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/menu" replace />;
  return <>{children}</>;
}

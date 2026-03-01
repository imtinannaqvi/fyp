import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Not logged in
  if (!user) return <Navigate to="/login" />;

  // Logged in but not admin
  if (user.role !== "admin") return <Navigate to="/" />;

  // Admin — allow access
  return children;
};

export default AdminRoute;
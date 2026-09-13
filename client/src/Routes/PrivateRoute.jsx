import { Outlet, Navigate, useLocation } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ allowAdmin = true }) {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!allowAdmin && isAdmin) return <Navigate to="/profile/admin" replace />;

  return <Outlet />;
}

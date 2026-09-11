import { Outlet, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute() {
  const { user, isAdmin, loading } = useAuth();

  if (loading) return <Spinner />;
  return user && isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
}

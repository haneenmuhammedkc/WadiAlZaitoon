import { Outlet, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

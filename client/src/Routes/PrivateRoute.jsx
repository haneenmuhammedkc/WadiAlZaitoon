import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { apiFetch } from "../services/api";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(true);

  const authCheck = async () => {
    try {
      const data = await apiFetch("/api/user/user-auth");
      if (data?.check) {
        setOk(true);
      } else {
        setOk(false);
      }
    } catch {
      setOk(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser !== null) {
      authCheck();
    } else {
      setLoading(false);
      setOk(false);
    }
  }, [currentUser]);

  if (loading) return <Spinner />;
  return ok ? <Outlet /> : <Navigate to="/login" replace />;
}

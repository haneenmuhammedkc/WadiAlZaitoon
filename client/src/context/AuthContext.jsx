import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { login as loginApi, logout as logoutApi } from "../services/authService";
import { checkUserAuth } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Validate existing backend session on initial mount / page refresh
  const checkAuth = async () => {
    try {
      setLoading(true);
      const data = await checkUserAuth();
      if (data?.success && data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginApi(credentials);
      if (data?.success && data?.user) {
        setUser(data.user);
        setLoading(false);
        return { success: true, user: data.user, data };
      } else {
        const msg = data?.message || "Login failed";
        setError(msg);
        setLoading(false);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Login failed";
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutApi();
    } catch (err) {
      // Ignore API logout error and clear local auth state
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  const value = useMemo(
    () => ({
      user,
      currentUser: user, // Alias for 100% drop-in compatibility with components reading currentUser
      isAuthenticated: !!user,
      isAdmin: user?.user_role === "admin",
      loading,
      error,
      login,
      logout,
      updateUser,
      checkAuth,
    }),
    [user, loading, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;

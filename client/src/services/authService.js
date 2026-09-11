import axiosInstance from "./axiosInstance";

/**
 * Service helper for user authentication (signup, login, logout)
 */
export const signup = async (userData) => {
  try {
    const res = await axiosInstance.post("/auth/signup", userData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const login = async (credentials) => {
  try {
    const res = await axiosInstance.post("/auth/login", credentials);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const logout = async () => {
  try {
    const res = await axiosInstance.get("/auth/logout");
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default {
  signup,
  login,
  logout,
};

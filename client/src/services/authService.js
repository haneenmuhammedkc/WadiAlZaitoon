import axiosInstance from "./axiosInstance";

/**
 * Service helper for user authentication (signup, login, logout, OTP verification, password reset)
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

export const verifyEmail = async ({ email, otp }) => {
  try {
    const res = await axiosInstance.post("/auth/verify-email", { email, otp });
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const resendOtp = async ({ email, purpose = "EMAIL_VERIFICATION" }) => {
  try {
    const res = await axiosInstance.post("/auth/resend-otp", { email, purpose });
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const forgotPassword = async ({ email }) => {
  try {
    const res = await axiosInstance.post("/auth/forgot-password", { email });
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const verifyResetOtp = async ({ email, otp }) => {
  try {
    const res = await axiosInstance.post("/auth/verify-reset-otp", { email, otp });
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const resetPassword = async ({ email, resetToken, otp, newPassword }) => {
  try {
    const res = await axiosInstance.post("/auth/reset-password", { email, resetToken, otp, newPassword });
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default {
  signup,
  login,
  logout,
  verifyEmail,
  resendOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};

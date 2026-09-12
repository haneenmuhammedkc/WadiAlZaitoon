import axiosInstance from "./axiosInstance";

/**
 * Service helper for managing user profiles, authentication checks, and user administration
 */
export const updateProfile = async (userId, userData) => {
  try {
    const res = await axiosInstance.post(`/user/update/${userId}`, userData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const updatePassword = async (userId, passwordData) => {
  try {
    const res = await axiosInstance.post(`/user/update-password/${userId}`, passwordData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const deleteUser = async (userId) => {
  try {
    const res = await axiosInstance.delete(`/user/delete/${userId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getAllUsers = async () => {
  try {
    const res = await axiosInstance.get("/user/getAllUsers");
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const deleteUserAdmin = async (userId) => {
  try {
    const res = await axiosInstance.delete(`/user/delete-user/${userId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const checkUserAuth = async () => {
  try {
    const res = await axiosInstance.get("/user/user-auth");
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const checkAdminAuth = async () => {
  try {
    const res = await axiosInstance.get("/user/admin-auth");
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default {
  updateProfile,
  updatePassword,
  deleteUser,
  getAllUsers,
  deleteUserAdmin,
  checkUserAuth,
  checkAdminAuth,
};

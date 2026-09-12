import axiosInstance from "./axiosInstance";

/**
 * Service helper for managing tour packages with backend MongoDB API
 */
export const getPackages = async (queryParams = "") => {
  const path = `/package/get-packages${queryParams ? (queryParams.startsWith("?") ? queryParams : `?${queryParams}`) : ""}`;
  try {
    const res = await axiosInstance.get(path);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getPackageById = async (id) => {
  try {
    const res = await axiosInstance.get(`/package/get-package-data/${id}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const createPackage = async (packageData) => {
  try {
    const res = await axiosInstance.post("/package/create-package", packageData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const updatePackage = async (id, packageData) => {
  try {
    const res = await axiosInstance.post(`/package/update-package/${id}`, packageData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const deletePackage = async (id) => {
  try {
    const res = await axiosInstance.delete(`/package/delete-package/${id}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default {
  getPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
};

import axiosInstance from "./axiosInstance";

/**
 * Service helper for handling passenger/traveller details and manifests
 */
export const getTravellers = async (bookingId) => {
  try {
    const res = await axiosInstance.get(`/traveller/${bookingId}/travellers`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const submitTravellers = async (bookingId, travellersData) => {
  try {
    const res = await axiosInstance.post(`/traveller/${bookingId}/travellers`, travellersData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getManifest = async (bookingId) => {
  try {
    const res = await axiosInstance.get(`/traveller/admin/manifest/${bookingId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default {
  getTravellers,
  submitTravellers,
  getManifest,
};

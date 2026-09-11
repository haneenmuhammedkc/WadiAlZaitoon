import axiosInstance from "./axiosInstance";

/**
 * Service helper for managing bookings with backend MongoDB API
 */
export const getCurrentBookings = async (userId = "") => {
  const endpoint = userId ? `/booking/get-currentBookings/${userId}` : "/booking/get-currentBookings";
  try {
    const res = await axiosInstance.get(endpoint);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getUserCurrentBookings = async (userId) => {
  try {
    const res = await axiosInstance.get(`/booking/get-UserCurrentBookings/${userId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getAllUserBookings = async (userId) => {
  try {
    const res = await axiosInstance.get(`/booking/get-allUserBookings/${userId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getAllBookings = async () => {
  try {
    const res = await axiosInstance.get("/booking/get-allBookings");
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const cancelBooking = async (bookingId, userId) => {
  try {
    const res = await axiosInstance.post(`/booking/cancel-booking/${bookingId}/${userId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const deleteBookingHistory = async (bookingId, userId) => {
  try {
    const res = await axiosInstance.delete(`/booking/delete-booking-history/${bookingId}/${userId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getInvoiceUrl = (bookingId) => {
  return `/api/booking/${bookingId}/invoice`;
};

export const downloadInvoice = async (bookingId) => {
  try {
    const res = await axiosInstance.get(`/booking/${bookingId}/invoice`, {
      responseType: "blob",
    });
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default {
  getCurrentBookings,
  getUserCurrentBookings,
  getAllUserBookings,
  getAllBookings,
  cancelBooking,
  deleteBookingHistory,
  getInvoiceUrl,
  downloadInvoice,
};

import axiosInstance from "./axiosInstance";

// Fetch all active hotels with optional destination and search filters
export const fetchHotels = async ({ destination = "", searchTerm = "", adminView = false } = {}) => {
  const queryParams = new URLSearchParams();
  if (destination && destination !== "All Stays") queryParams.append("destination", destination);
  if (searchTerm) queryParams.append("searchTerm", searchTerm);
  if (adminView) queryParams.append("adminView", "true");

  const queryString = queryParams.toString();
  const path = `/hotel${queryString ? `?${queryString}` : ""}`;
  try {
    const res = await axiosInstance.get(path);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Fetch single hotel details by ID
export const fetchHotelById = async (id) => {
  try {
    const res = await axiosInstance.get(`/hotel/${id}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Admin — Create hotel
export const createHotelApi = async (hotelData) => {
  try {
    const res = await axiosInstance.post("/hotel", hotelData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Admin — Update hotel
export const updateHotelApi = async (id, hotelData) => {
  try {
    const res = await axiosInstance.put(`/hotel/${id}`, hotelData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

// Admin — Deactivate / Soft-delete hotel
export const deleteHotelApi = async (id) => {
  try {
    const res = await axiosInstance.delete(`/hotel/${id}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

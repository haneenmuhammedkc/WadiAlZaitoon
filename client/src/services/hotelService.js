import { apiFetch } from "./api";

// Fetch all active hotels with optional destination and search filters
export const fetchHotels = async ({ destination = "", searchTerm = "", adminView = false } = {}) => {
  const queryParams = new URLSearchParams();
  if (destination && destination !== "All Stays") queryParams.append("destination", destination);
  if (searchTerm) queryParams.append("searchTerm", searchTerm);
  if (adminView) queryParams.append("adminView", "true");

  const queryString = queryParams.toString();
  const url = `/api/hotel${queryString ? `?${queryString}` : ""}`;
  return await apiFetch(url);
};

// Fetch single hotel details by ID
export const fetchHotelById = async (id) => {
  return await apiFetch(`/api/hotel/${id}`);
};

// Admin — Create hotel
export const createHotelApi = async (hotelData) => {
  return await apiFetch("/api/hotel", {
    method: "POST",
    body: JSON.stringify(hotelData),
  });
};

// Admin — Update hotel
export const updateHotelApi = async (id, hotelData) => {
  return await apiFetch(`/api/hotel/${id}`, {
    method: "PUT",
    body: JSON.stringify(hotelData),
  });
};

// Admin — Deactivate / Soft-delete hotel
export const deleteHotelApi = async (id) => {
  return await apiFetch(`/api/hotel/${id}`, {
    method: "DELETE",
  });
};

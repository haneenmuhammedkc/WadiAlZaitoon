import axiosInstance from "./axiosInstance";

/**
 * Service helper for handling customer reviews and star ratings
 */
export const submitRating = async (ratingData) => {
  try {
    const res = await axiosInstance.post("/rating/give-rating", ratingData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getPackageRatings = async (packageId, limit = 10) => {
  try {
    const res = await axiosInstance.get(`/rating/get-ratings/${packageId}/${limit}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const checkRatingGiven = async (userId, packageId) => {
  try {
    const res = await axiosInstance.get(`/rating/rating-given/${userId}/${packageId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getAverageRating = async (packageId) => {
  try {
    const res = await axiosInstance.get(`/rating/average-rating/${packageId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default {
  submitRating,
  getPackageRatings,
  checkRatingGiven,
  getAverageRating,
};

import mongoose from "mongoose";

/**
 * Escapes regex special characters to prevent regex injection and ReDoS attacks.
 * @param {string} str - User input search string
 * @returns {string} Safe string for MongoDB $regex queries
 */
export const escapeRegex = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Validates whether a string is a valid 24-character hex MongoDB ObjectId.
 * @param {string|any} id - The string to check
 * @returns {boolean} True if valid ObjectId, false otherwise
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== "string" && !(id instanceof mongoose.Types.ObjectId)) {
    return false;
  }
  const strId = String(id);
  return mongoose.Types.ObjectId.isValid(strId) && (new mongoose.Types.ObjectId(strId).toString() === strId);
};

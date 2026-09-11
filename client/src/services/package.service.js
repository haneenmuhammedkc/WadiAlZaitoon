import { apiFetch } from "./api";

/**
 * Service helper for fetching tour packages from backend MongoDB API
 */
export const getPackages = async (queryParams = "") => {
  const url = `/api/package/get-packages${queryParams ? (queryParams.startsWith("?") ? queryParams : `?${queryParams}`) : ""}`;
  return await apiFetch(url);
};

export const getPackageById = async (id) => {
  return await apiFetch(`/api/package/get-package-data/${id}`);
};

export default {
  getPackages,
  getPackageById,
};

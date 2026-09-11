import axiosInstance from "./axiosInstance";

export const apiFetch = async (url, options = {}) => {
  // Strip leading /api if present because axiosInstance has baseURL: "/api"
  let endpoint = url;
  if (endpoint.startsWith("/api/")) {
    endpoint = endpoint.substring(4);
  } else if (endpoint === "/api") {
    endpoint = "";
  }

  const method = (options.method || "GET").toLowerCase();

  try {
    const config = {
      headers: options.headers,
    };
    if (options.responseType) {
      config.responseType = options.responseType;
    }

    let res;
    if (method === "get") {
      res = await axiosInstance.get(endpoint, config);
    } else if (method === "post") {
      const data = options.body
        ? typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body
        : {};
      res = await axiosInstance.post(endpoint, data, config);
    } else if (method === "put") {
      const data = options.body
        ? typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body
        : {};
      res = await axiosInstance.put(endpoint, data, config);
    } else if (method === "delete") {
      res = await axiosInstance.delete(endpoint, config);
    } else if (method === "patch") {
      const data = options.body
        ? typeof options.body === "string"
          ? JSON.parse(options.body)
          : options.body
        : {};
      res = await axiosInstance.patch(endpoint, data, config);
    }

    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      status: error.response?.status || 500,
      message: error.message || "Network connection error",
    };
  }
};

export default apiFetch;

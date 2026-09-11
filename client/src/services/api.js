export const apiFetch = async (url, options = {}) => {
  const defaultHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
    credentials: "include",
  };

  try {
    const res = await fetch(url, config);
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text || `HTTP Status ${res.status}` };
      }
    }

    if (!res.ok) {
      return {
        success: false,
        status: res.status,
        message: data?.message || `Request failed with status ${res.status}`,
        data,
      };
    }

    return data;
  } catch (error) {
    return {
      success: false,
      status: 500,
      message: error.message || "Network connection error",
    };
  }
};

export default apiFetch;

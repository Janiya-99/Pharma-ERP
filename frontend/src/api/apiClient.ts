import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: unknown) => {
    const token = localStorage.getItem("erp_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: unknown) => {
    return response;
  },
  (error: unknown) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("erp_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;

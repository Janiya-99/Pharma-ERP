import axios from "axios";
import Cookies from "js-cookie";

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: any) => {
    const token =
      Cookies.get("erp_token") ||
      (typeof localStorage !== "undefined" ? localStorage.getItem("erp_token") : null);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    if (error.response && error.response.status === 401) {
      const token =
        Cookies.get("erp_token") ||
        (typeof localStorage !== "undefined" ? localStorage.getItem("erp_token") : null);
      if (token) {
        Cookies.remove("erp_token");
        if (typeof localStorage !== "undefined") {
          localStorage.removeItem("erp_token");
        }
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

import axios from "axios";
import Cookies from "js-cookie";

// Base API client for communicating with the Go backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor — attach auth token if available
apiClient.interceptors.request.use(
  (config: any) => {
    const token = Cookies.get("erp_token") || Cookies.get("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response interceptor — handle common errors
apiClient.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — future: redirect to login
      console.warn("Unauthorized — token may be expired");
    }
    return Promise.reject(error);
  }
);

export default apiClient;

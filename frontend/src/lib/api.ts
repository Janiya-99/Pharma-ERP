/**
 * api.ts — Axios instance with JWT interceptor
 * The backend (Go) uses Redis to cache sessions server-side.
 * Frontend stores the access token in memory only (secure).
 * Refresh token is expected as httpOnly cookie from the Go backend.
 */

import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from "axios";
import { useAuthStore } from "store/authStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor — attach JWT access token from Zustand store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — handle 401 (token expired) and trigger refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (val: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            (originalRequest.headers as any)["Authorization"] = `Bearer ${token}`;
          }
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("No refresh token available");

        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken }
        );
        const { access_token, refresh_token: new_refresh_token } = response.data.data.tokens;
        
        useAuthStore.getState().setAccessToken(access_token);
        if (new_refresh_token) {
          useAuthStore.getState().setRefreshToken(new_refresh_token);
        }
        
        processQueue(null, access_token);
        if (originalRequest.headers) {
          (originalRequest.headers as any)["Authorization"] = `Bearer ${access_token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = "/auth/sign-in";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

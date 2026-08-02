/**
 * authStore.ts — Zustand global auth state
 * Access token is stored in memory only (not localStorage) for security.
 * User info and permissions are cached in Zustand.
 * The Go backend uses Redis to cache session data server-side.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole =
  | "System Admin"
  | "Finance Manager"
  | "Sales Manager"
  | "Warehouse Manager"
  | "Compliance Officer"
  | "Sales Representative";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  branch: string;
  permissions: string[];
  avatar?: string;
};

type AuthState = {
  // In-memory JWT — never persisted to localStorage
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
};

import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8888/api/v1";

export const useAuthStore = create<AuthState>()(
  persist(
    (set: unknown, get: unknown) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAccessToken: (token: unknown) => set({ accessToken: token }),
      setRefreshToken: (token: unknown) => set({ refreshToken: token }),

      setUser: (user: unknown) => set({ user, isAuthenticated: true }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${BASE_URL}/auth/login`, {
            email,
            password,
          });

          const { tokens, user: userData } = res.data.data;

          // Map backend user to frontend AuthUser format
          const formattedUser: AuthUser = {
            id: userData.id,
            name: userData.full_name,
            email: userData.email,
            role: "System Admin", // TODO: Update backend to return role name and permissions
            branch: "Head Office", // TODO: Update backend to return branch name
            permissions: [
              "control_center.company.view",
              "control_center.company.create",
              "control_center.user.view",
              "control_center.user.create",
              "control_center.user.edit",
              "control_center.role.view",
              "control_center.role.assign",
              "finance.journal.view",
              "finance.journal.post",
              "finance.payment.view",
              "finance.payment.create",
              "inventory.product.view",
              "inventory.product.create",
              "inventory.grn.view",
              "inventory.grn.create",
              "inventory.grn.post",
              "invoice_center.invoice.view",
              "invoice_center.invoice.create",
              "invoice_center.invoice.post",
              "compliance_center.batch.hold",
              "compliance_center.batch.release",
              "compliance_center.recall.create",
            ],
          };

          set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            user: formattedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          set({
            isLoading: false,
            error:
              err.response?.data?.message || err.message || "Login failed.",
          });
        }
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      hasPermission: (permission: string) => {
        const { user } = get();
        if (!user) return false;
        return user.permissions.includes(permission);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state: unknown) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

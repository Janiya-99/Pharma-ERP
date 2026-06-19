/**
 * authStore.ts — Zustand global auth state
 * Access token is stored in memory only (not localStorage) for security.
 * User info and permissions are cached in Zustand.
 * The Go backend uses Redis to cache session data server-side.
 */

import { create } from "zustand";

export type UserRole = "System Admin" | "Finance Manager" | "Sales Manager" | "Warehouse Manager" | "Compliance Officer" | "Sales Representative";

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
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAccessToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
};

// Mock user for development (replace with real API call)
const MOCK_USER: AuthUser = {
  id: 1,
  name: "Kamali Fernando",
  email: "kamali@pharmadist.lk",
  role: "System Admin",
  branch: "Head Office",
  permissions: [
    "control_center.company.view", "control_center.company.create",
    "control_center.user.view", "control_center.user.create", "control_center.user.edit",
    "control_center.role.view", "control_center.role.assign",
    "finance.journal.view", "finance.journal.post",
    "finance.payment.view", "finance.payment.create",
    "inventory.product.view", "inventory.product.create",
    "inventory.grn.view", "inventory.grn.create", "inventory.grn.post",
    "invoice_center.invoice.view", "invoice_center.invoice.create", "invoice_center.invoice.post",
    "compliance_center.batch.hold", "compliance_center.batch.release", "compliance_center.recall.create",
  ],
};

const MOCK_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.development";

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user, isAuthenticated: true }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      // === MOCK LOGIN (replace with real API call to Go backend) ===
      // Real implementation:
      // const res = await axios.post("/api/v1/auth/login", { email, password }, { withCredentials: true });
      // const { accessToken, user } = res.data;
      await new Promise((r) => setTimeout(r, 600)); // Simulate network latency

      if (email === "kamali@pharmadist.lk" && password === "admin123") {
        set({
          accessToken: MOCK_TOKEN,
          user: MOCK_USER,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error("Invalid email or password.");
      }
      // ============================================================
    } catch (err: any) {
      set({ isLoading: false, error: err.message || "Login failed." });
    }
  },

  logout: () => {
    // Real implementation: call POST /api/v1/auth/logout to clear Redis session + cookie
    set({ accessToken: null, user: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null }),

  hasPermission: (permission: string) => {
    const { user } = get();
    if (!user) return false;
    return user.permissions.includes(permission);
  },
}));

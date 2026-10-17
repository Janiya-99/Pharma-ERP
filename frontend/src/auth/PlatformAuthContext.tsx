import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
import { platformLogin, platformGetMe } from "../api/platformAdminApi";

export interface PlatformAuthContextType {
  token: string | null;
  user: any;
  loading: boolean;
  isAuthenticated: boolean;
  loginUser: (email: any, password: any) => Promise<any>;
  logoutUser: () => void;
  refreshContext: () => Promise<void>;
}

const PlatformAuthContext = createContext<PlatformAuthContextType>({} as PlatformAuthContextType);

export const usePlatformAuth = () => useContext(PlatformAuthContext);

const getStoredPlatformToken = () => {
  return (
    Cookies.get("platform_admin_token") ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("platform_admin_token") : null)
  );
};

const storePlatformToken = (tokenStr: string) => {
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  Cookies.set("platform_admin_token", tokenStr, { expires: 7, secure: isHttps, sameSite: isHttps ? "strict" : "lax" });
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("platform_admin_token", tokenStr);
  }
};

const clearStoredPlatformToken = () => {
  Cookies.remove("platform_admin_token");
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("platform_admin_token");
  }
};

export const PlatformAuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [token, setToken] = useState(getStoredPlatformToken() || null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const logoutUser = useCallback(() => {
    clearStoredPlatformToken();
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const refreshContext = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await platformGetMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        logoutUser();
      }
    } catch (error) {
      console.error("Failed to load platform auth context", error);
      logoutUser();
    } finally {
      setLoading(false);
    }
  }, [token, logoutUser]);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  const loginUser = async (email: unknown, password: unknown) => {
    try {
      const res = await platformLogin({ email, password });
      if (res.success && res.token) {
        storePlatformToken(res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "An error occurred during platform login",
      };
    }
  };

  const value = {
    token,
    user,
    loading,
    isAuthenticated,
    loginUser,
    logoutUser,
    refreshContext,
  };

  return <PlatformAuthContext.Provider value={value}>{children}</PlatformAuthContext.Provider>;
};

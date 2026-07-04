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

export const PlatformAuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [token, setToken] = useState(Cookies.get("platform_admin_token") || null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const logoutUser = useCallback(() => {
    Cookies.remove("platform_admin_token");
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
        Cookies.set("platform_admin_token", res.token, { expires: 7, secure: true, sameSite: "strict" });
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

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  login,
  getAuthContext,
  switchBranch,
  switchSoftware,
} from "../api/authApi";

export interface AuthContextType {
  token: string | null;
  user: any;
  company: any;
  activeBranch: any;
  activeSoftware: any;
  branches: any[];
  softwareModules: any[];
  permissions: string[];
  loading: boolean;
  isAuthenticated: boolean;
  loginUser: (email: any, password: any) => Promise<any>;
  logoutUser: () => void;
  refreshContext: () => Promise<void>;
  switchActiveBranch: (branchId: string | number) => Promise<boolean>;
  switchActiveSoftware: (softwareCode: any) => Promise<boolean>;
  hasPermission: (permissionKey: any) => boolean;
  hasAnyPermission: (permissionKeys: any[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [token, setToken] = useState(localStorage.getItem("erp_token") || null);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [activeBranch, setActiveBranch] = useState(null);
  const [activeSoftware, setActiveSoftware] = useState(null);
  const [branches, setBranches] = useState([]);
  const [softwareModules, setSoftwareModules] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const refreshContext = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getAuthContext();

      // Handle both {success: true, data: {...}} and direct object {...}
      const data = res.data || res;
      const isSuccess = res.success !== false; // Treat undefined as success

      if (isSuccess && data && data.user) {
        setUser(data.user);
        setCompany(data.company);
        setActiveBranch(data.active_branch);
        setActiveSoftware(data.active_software);
        setBranches(data.branches || []);
        setSoftwareModules(data.software_modules || []);
        setPermissions(data.permissions || []);
      } else {
        logoutUser();
      }
    } catch (error) {
      console.error("Failed to load auth context", error);
      logoutUser();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshContext();
  }, [refreshContext]);

  const loginUser = async (email: unknown, password: unknown) => {
    try {
      const res = await login({ email, password });

      // Handle different token path structures
      const data = res.data || res;
      const tokenStr = data?.tokens?.access_token || res.token || data?.token;
      const isSuccess = res.success !== false;

      if (isSuccess && tokenStr) {
        localStorage.setItem("erp_token", tokenStr);
        setToken(tokenStr);

        // If login returns the context, set it immediately to prevent redirect loops
        if (data && data.user) {
          setUser(data.user);
          setCompany(data.company);
          setActiveBranch(data.active_branch);
          setActiveSoftware(data.active_software);
          setBranches(data.branches || []);
          setSoftwareModules(data.software_modules || []);
          setPermissions(data.permissions || []);
        }

        return { success: true };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || "An error occurred during login",
      };
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("erp_token");
    setToken(null);
    setUser(null);
    setCompany(null);
    setActiveBranch(null);
    setActiveSoftware(null);
    setBranches([]);
    setSoftwareModules([]);
    setPermissions([]);
    window.location.href = "/login";
  };

  const switchActiveBranch = async (branchId: string | number) => {
    try {
      setLoading(true);
      const res = await switchBranch(branchId);
      const token =
        res.data?.tokens?.access_token || res.token || res.data?.token;
      const isSuccess = res.success !== false;
      if (isSuccess && token) {
        localStorage.setItem("erp_token", token);
        setToken(token);
        await refreshContext();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to switch branch", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const switchActiveSoftware = async (softwareCode: unknown) => {
    try {
      setLoading(true);
      const res = await switchSoftware(softwareCode);
      const token =
        res.data?.tokens?.access_token || res.token || res.data?.token;
      const isSuccess = res.success !== false;
      if (isSuccess && token) {
        localStorage.setItem("erp_token", token);
        setToken(token);
        await refreshContext();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to switch software", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permissionKey: unknown) => {
    if (
      user?.user_type === "super_admin" &&
      activeSoftware?.software_code === "CONTROL_CENTER"
    ) {
      return true;
    }
    return permissions.includes(permissionKey);
  };

  const hasAnyPermission = (permissionKeys: unknown) => {
    if (
      user?.user_type === "super_admin" &&
      activeSoftware?.software_code === "CONTROL_CENTER"
    ) {
      return true;
    }
    return permissionKeys.some((key: unknown) => permissions.includes(key));
  };

  const value = {
    token,
    user,
    company,
    activeBranch,
    activeSoftware,
    branches,
    softwareModules,
    permissions,
    loading,
    isAuthenticated,
    loginUser,
    logoutUser,
    refreshContext,
    switchActiveBranch,
    switchActiveSoftware,
    hasPermission,
    hasAnyPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

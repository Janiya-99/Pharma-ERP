import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import Cookies from "js-cookie";
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

const getStoredToken = () => {
  return (
    Cookies.get("erp_token") ||
    (typeof localStorage !== "undefined" ? localStorage.getItem("erp_token") : null)
  );
};

const storeToken = (tokenStr: string) => {
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  Cookies.set("erp_token", tokenStr, { expires: 7, secure: isHttps, sameSite: isHttps ? "strict" : "lax" });
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("erp_token", tokenStr);
  }
};

const clearStoredToken = () => {
  Cookies.remove("erp_token");
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("erp_token");
  }
};

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [token, setToken] = useState(getStoredToken() || null);
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
      // Only show full-screen blocking loader if we don't already have user context
      if (!user) {
        setLoading(true);
      }
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
  }, [token, user]);

  useEffect(() => {
    refreshContext();
  }, [token]);

  const loginUser = async (email: unknown, password: unknown) => {
    try {
      const res = await login({ email, password });

      // Handle different token path structures
      const data = res.data || res;
      const tokenStr = data?.tokens?.access_token || res.token || data?.token;
      const isSuccess = res.success !== false;

      if (isSuccess && tokenStr) {
        storeToken(tokenStr);
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

        return { success: true, softwareModules: data.software_modules || [] };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (error) {
      return {
        success: false,
        message:
          (error as any).response?.data?.message || "An error occurred during login",
      };
    }
  };

  const logoutUser = () => {
    const hadToken = !!getStoredToken();
    clearStoredToken();
    setToken(null);
    setUser(null);
    setCompany(null);
    setActiveBranch(null);
    setActiveSoftware(null);
    setBranches([]);
    setSoftwareModules([]);
    setPermissions([]);
    if (hadToken && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  const switchActiveBranch = async (branchId: string | number) => {
    try {
      const res = await switchBranch(branchId);
      const data = res.data || res;
      const token =
        data?.tokens?.access_token || res.token || data?.token;
      const isSuccess = res.success !== false;
      if (isSuccess && token) {
        storeToken(token);
        setToken(token);
        if (data.active_branch) {
          setActiveBranch(data.active_branch);
        }
        if (data.permissions) {
          setPermissions(data.permissions);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to switch branch", error);
      return false;
    }
  };

  const switchActiveSoftware = async (softwareCode: unknown) => {
    try {
      // Optimistically update activeSoftware immediately to eliminate lag and prevent double fetches
      const found = softwareModules.find(
        (m: any) => m.software_code === softwareCode || m.code === softwareCode
      );
      if (found) {
        setActiveSoftware(found);
      } else if (typeof softwareCode === "string") {
        setActiveSoftware((prev: any) => ({
          ...prev,
          software_code: softwareCode,
        }));
      }

      const res = await switchSoftware(softwareCode);
      const data = res.data || res;
      const token =
        data?.tokens?.access_token || res.token || data?.token;
      const isSuccess = res.success !== false;
      if (isSuccess && token) {
        storeToken(token);
        setToken(token);
        if (data.active_software) {
          setActiveSoftware(data.active_software);
        }
        if (data.permissions) {
          setPermissions(data.permissions);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to switch software", error);
      return false;
    }
  };

  const checkSinglePermission = (permissionKey: any): boolean => {
    if (user?.user_type === "super_admin") {
      return true;
    }
    if (!permissionKey) return true;
    if (permissions.includes("*") || permissions.includes(permissionKey)) {
      return true;
    }

    // 1. Module dashboard access fallback: if user has access to this software module, allow dashboard view
    const isDashboard =
      permissionKey === "control_center.dashboard.view" ||
      permissionKey === "control.dashboard.view" ||
      permissionKey === "finance.dashboard.view" ||
      permissionKey === "inventory.dashboard.view" ||
      permissionKey === "invoice_center.dashboard.view" ||
      permissionKey === "invoice.dashboard.view" ||
      permissionKey === "compliance.dashboard.view";

    if (isDashboard) {
      let modCode = "";
      if (permissionKey.startsWith("control")) modCode = "CONTROL_CENTER";
      else if (permissionKey.startsWith("finance")) modCode = "FINANCE";
      else if (permissionKey.startsWith("inventory")) modCode = "INVENTORY";
      else if (permissionKey.startsWith("invoice")) modCode = "INVOICE_CENTER";
      else if (permissionKey.startsWith("compliance")) modCode = "COMPLIANCE_CENTER";

      const hasMod = softwareModules.some((sm: any) => {
        const c = sm.software_code || sm.code;
        return c === modCode || (modCode === "COMPLIANCE_CENTER" && (c === "COMPLIANCE" || c === "COMPLIANCE_CENTER"));
      });
      if (hasMod) return true;
    }

    // 2. Control Center prefix mapping (control_center.* <-> control.*)
    if (typeof permissionKey === "string") {
      if (permissionKey.startsWith("control_center.")) {
        const altKey = "control." + permissionKey.slice("control_center.".length);
        if (permissions.includes(altKey)) return true;
        if (altKey === "control.audit_log.view" && permissions.includes("control.audit.view")) return true;
        if (altKey === "control.access_audit.view" && permissions.includes("control.audit.view")) return true;
        if (altKey === "control.login_history.view" && permissions.includes("control.login_logs.view")) return true;
        if (altKey === "control.software_module.view" && (permissions.includes("control.access.software.view") || permissions.includes("control.permission.view"))) return true;
        if (altKey === "control.approval_setting.view" && (permissions.includes("control.approval_workflow.view") || permissions.includes("control_center.approval_workflow.view"))) return true;
      } else if (permissionKey.startsWith("control.")) {
        const altKey = "control_center." + permissionKey.slice("control.".length);
        if (permissions.includes(altKey)) return true;
      }

      // 3. Invoice Center prefix mapping (invoice_center.* <-> invoice.*)
      if (permissionKey.startsWith("invoice_center.")) {
        const altKey = "invoice." + permissionKey.slice("invoice_center.".length);
        if (permissions.includes(altKey)) return true;
      } else if (permissionKey.startsWith("invoice.")) {
        const altKey = "invoice_center." + permissionKey.slice("invoice.".length);
        if (permissions.includes(altKey)) return true;
      }

      // 4. Compliance mapping aliases
      if (permissionKey === "compliance.record.view" && permissions.includes("compliance.nmra.view")) return true;
      if (permissionKey === "compliance.license.view" && permissions.includes("compliance.nmra.view")) return true;
      if (permissionKey === "compliance.recall.view" && permissions.includes("compliance.batch_recall.view")) return true;
      if (permissionKey === "compliance.disposal.view" && permissions.includes("compliance.expiry_disposal.view")) return true;
    }

    return false;
  };

  const hasPermission = (permissionKey: any) => {
    return checkSinglePermission(permissionKey);
  };

  const hasAnyPermission = (permissionKeys: any[]) => {
    if (user?.user_type === "super_admin") {
      return true;
    }
    if (!permissionKeys || permissionKeys.length === 0) return true;
    return permissionKeys.some((key: any) => checkSinglePermission(key));
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

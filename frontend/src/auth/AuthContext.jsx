import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { login, getAuthContext, switchBranch, switchSoftware } from "../api/authApi";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
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
      if (res.success && res.data) {
        setUser(res.data.user);
        setCompany(res.data.company);
        setActiveBranch(res.data.active_branch);
        setActiveSoftware(res.data.active_software);
        setBranches(res.data.branches || []);
        setSoftwareModules(res.data.software_modules || []);
        setPermissions(res.data.permissions || []);
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

  const loginUser = async (companyCode, email, password) => {
    try {
      const res = await login({ company_code: companyCode, email, password });
      const token = res.data?.tokens?.access_token || res.token;
      if (res.success && token) {
        localStorage.setItem("erp_token", token);
        setToken(token);
        return { success: true };
      }
      return { success: false, message: res.message || "Login failed" };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "An error occurred during login",
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

  const switchActiveBranch = async (branchId) => {
    try {
      setLoading(true);
      const res = await switchBranch(branchId);
      const token = res.data?.tokens?.access_token || res.token;
      if (res.success && token) {
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

  const switchActiveSoftware = async (softwareCode) => {
    try {
      setLoading(true);
      const res = await switchSoftware(softwareCode);
      const token = res.data?.tokens?.access_token || res.token;
      if (res.success && token) {
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

  const hasPermission = (permissionKey) => {
    if (user?.user_type === "super_admin" && activeSoftware?.software_code === "CONTROL_CENTER") {
      return true;
    }
    return permissions.includes(permissionKey);
  };

  const hasAnyPermission = (permissionKeys) => {
    if (user?.user_type === "super_admin" && activeSoftware?.software_code === "CONTROL_CENTER") {
      return true;
    }
    return permissionKeys.some((key) => permissions.includes(key));
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

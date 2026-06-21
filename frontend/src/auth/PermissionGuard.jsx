import React from "react";
import { useAuth } from "./AuthContext";

const PermissionGuard = ({ permission, permissions, mode = "all", children, fallback = null }) => {
  const { hasPermission, hasAnyPermission, loading } = useAuth();

  if (loading) return null;

  if (permission) {
    if (hasPermission(permission)) {
      return <>{children}</>;
    }
  } else if (permissions && Array.isArray(permissions)) {
    if (mode === "any" && hasAnyPermission(permissions)) {
      return <>{children}</>;
    } else if (mode === "all" && permissions.every(hasPermission)) {
      return <>{children}</>;
    }
  }

  return fallback;
};

export default PermissionGuard;

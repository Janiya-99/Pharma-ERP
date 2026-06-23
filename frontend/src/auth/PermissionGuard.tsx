import React from "react";
import { useAuth } from "./AuthContext";

const PermissionGuard = ({ permission, permissions, mode = "all", children, fallback = null }: { permission?: unknown; permissions?: unknown; mode?: unknown; children?: React.ReactNode; fallback?: unknown }) => {
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

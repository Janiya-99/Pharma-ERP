import React from "react";
import { useAuth } from "./AuthContext";

type PermissionGuardProps = {
  permission?: string | null;
  permissions?: string[] | null;
  mode?: "all" | "any";
  children?: React.ReactNode;
  fallback?: React.ReactNode;
};

const PermissionGuard = ({
  permission,
  permissions,
  mode = "all",
  children,
  fallback = null,
}: PermissionGuardProps): React.ReactNode => {
  const { hasPermission, hasAnyPermission, loading } = useAuth();

  if (loading) return null;

  // If no permission requirements specified, allow access
  if (
    !permission &&
    (!permissions || !Array.isArray(permissions) || permissions.length === 0)
  ) {
    return <>{children}</>;
  }

  if (permission) {
    if (hasPermission(permission)) {
      return <>{children}</>;
    }
  } else if (permissions && Array.isArray(permissions)) {
    if (mode === "any" && hasAnyPermission(permissions)) {
      return <>{children}</>;
    } else if (
      mode === "all" &&
      permissions.every((key) => hasPermission(key))
    ) {
      return <>{children}</>;
    }
  }

  return fallback;
};

export default PermissionGuard;

/**
 * ProtectedRoute.tsx
 * Wraps all admin routes. Redirects to /auth/sign-in if unauthenticated.
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "store/authStore";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = useAuthStore((s: unknown) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return children;
}

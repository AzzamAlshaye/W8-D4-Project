// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

/**
 * <ProtectedRoute requiredRole="admin" />
 * - If user not logged in → redirect to /login
 * - If user logged in but wrong role → redirect to “/unauthorized” or “/”
 * - Else → render <Outlet />
 */
export default function ProtectedRoute({ requiredRole = null }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.userType !== requiredRole) {
    // Wrong role
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}


import React from "react";
import { Navigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import AccessDenied from "./AccessDenied";
import { getDefaultRoute, hasModuleAccess, useAuthSession } from "./auth";

export default function ProtectedRoute({ children, requiredModule }) {
  const { auth, loading } = useAuthSession();

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!auth?.token) {
    return <Navigate to="/" replace />;
  }

  if (!hasModuleAccess(auth, requiredModule)) {
    return requiredModule === "dashboard" ? (
      <Navigate to={getDefaultRoute(auth)} replace />
    ) : (
      <AccessDenied />
    );
  }

  return children;
}

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth0 } from "@auth0/auth0-react";

function AuthWrapper() {
  const { isAuthenticated, isLoading } = useAuth0();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default AuthWrapper;
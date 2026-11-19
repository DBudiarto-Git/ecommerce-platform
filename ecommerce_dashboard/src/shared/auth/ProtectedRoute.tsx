import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { SYSTEM_ROLES, type AppRole } from './auth-types';

interface ProtectedRouteProps {
  allowedRoles?: AppRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Kunden (CUSTOMER) dürfen das Admin-Dashboard grundsätzlich nicht betreten
  //if (user.role === 'CUSTOMER') {
  if (user.role === SYSTEM_ROLES.CUSTOMER) {
    return <Navigate to="/login" replace />;
  }

  // Falls spezifische Rollen gefordert sind (z. B. nur ADMIN für Benutzerverwaltung)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

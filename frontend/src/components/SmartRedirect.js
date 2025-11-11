import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Smart redirect component that sends users to the first page they have access to
 */
export default function SmartRedirect() {
  const { user } = useAuth();

  // Determine the first accessible page for the user
  const getDefaultRoute = () => {
    if (!user) {
      return '/login';
    }

    // Admin can access everything, default to exclusivity-form
    if (user.role === 'admin') {
      return '/dashboard/exclusivity-form';
    }

    // EPC users can access exclusivity-form, item-maintenance, store-maintenance
    if (user.businessUnit === 'EPC') {
      return '/dashboard/exclusivity-form';
    }

    // NBFI users - show user management if available, otherwise show error
    // For now, we'll show exclusivity-form and let the Dashboard handle the access message
    return '/dashboard/exclusivity-form';
  };

  return <Navigate to={getDefaultRoute()} replace />;
}

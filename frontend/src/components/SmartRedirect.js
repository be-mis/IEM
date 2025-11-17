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

    // All authenticated users default to exclusivity-form
    // Dashboard will conditionally render EPC or NBFI form based on business unit
    return '/exclusivity-form';
  };

  return <Navigate to={getDefaultRoute()} replace />;
}

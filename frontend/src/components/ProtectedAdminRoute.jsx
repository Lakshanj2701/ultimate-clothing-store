import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedAdminRoute = () => {
  // Get user from localStorage
  const userString = localStorage.getItem('user');
  
  // Check if user exists and is an admin
  if (!userString) {
    // No user found, redirect to login
    return <Navigate to="/login" replace />;
  }
  
  try {
    const user = JSON.parse(userString);
    
    if (user.role !== 'admin') {
      // User is not an admin, redirect to home
      return <Navigate to="/" replace />;
    }
    
    // User is authenticated and is an admin, render the outlet
    return <Outlet />;
  } catch (error) {
    // Error parsing user, redirect to login
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedAdminRoute;
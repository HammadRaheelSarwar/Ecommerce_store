import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

  if (!userInfo) {
    return <Navigate to="/login" replace />;
  }

  if (userInfo.isVerified === false) {
    return <Navigate to="/verify-email" replace />;
  }
  
  if (adminOnly && userInfo.role !== 'admin') {
     return <Navigate to="/shop/Male" replace />;
  }

  return children;
};
export default ProtectedRoute;

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // Agar token exist karta hai toh child components render honge, 
  // warna user automatically login page par redirect ho jayega.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Navbar from './components/Navbar';
import TableBooking from './pages/Booking/TableBooking';
import MyBookings from './pages/Booking/MyBookings';
import Menu from './pages/Menu/Menu';
import Checkout from './pages/Checkout/Checkout';
import MyOrders from './pages/Order/MyOrders';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Navbar />
      
      {/* Toast Popups */}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div className="container py-4">
        <Routes>
          {/* Landing / Default Route -> Pehle Login Page Khulega */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes (Login hone ke baad hi access honge) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/menu" element={<Menu />} />
            <Route path="/booking" element={<TableBooking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
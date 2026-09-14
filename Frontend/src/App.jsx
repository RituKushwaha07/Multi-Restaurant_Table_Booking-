import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Menu from './pages/Menu/Menu';
import Checkout from './pages/Checkout/Checkout';
import MyOrders from './pages/Order/MyOrders';
import BookTable from './pages/Booking/tableBooking';
import MyBookings from './pages/Booking/MyBookings';

// Internal Layout: Navbar is rendered only for protected routes after login
const DashboardLayout = () => {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <Outlet />
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        {/* PUBLIC ROUTES (Clean screens without Navbar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES (Requires authentication) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/book-table" element={<BookTable />} />
            <Route path="/my-bookings" element={<MyBookings />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
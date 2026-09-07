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

// Internal Layout: Navbar sirf tabhi render hoga jab user login hoke protected route par aayega
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
        {/* PUBLIC ROUTES (Bina Navbar ke simple clean screen) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PROTECTED ROUTES (Login hone ke baad hi Navbar ke sath load honge) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/menu" replace />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-orders" element={<MyOrders />} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
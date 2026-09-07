import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // Check LocalStorage for authentication state
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.setAttribute('data-bs-theme', 'dark');
    } else {
      setDarkMode(false);
      document.body.setAttribute('data-bs-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    if (darkMode) {
      document.body.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.body.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className={`navbar navbar-expand-lg sticky-top py-3 transition-all ${darkMode ? 'navbar-dark bg-dark border-bottom border-secondary' : 'navbar-light bg-white shadow-sm'}`}>
      <div className="container-fluid px-4 px-md-5">
        
        {/* Brand Logo & Name */}
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center text-warning" to="/menu">
          <i className="bi bi-utensils me-2 fs-3 text-warning"></i>
          <span className={darkMode ? 'text-white' : 'text-dark'}>Restro<span className="text-warning">App</span></span>
        </Link>

        {/* Mobile Toggler Button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/menu">Menu</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/booking">Book Table</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/my-bookings">My Bookings</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3" to="/my-orders">My Orders</Link>
            </li>

            {/* Dark/Light Mode Toggle Switch Button */}
            <li className="nav-item ms-lg-2 my-2 my-lg-0">
              <button 
                onClick={toggleTheme} 
                className={`btn btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`}
                title="Toggle Theme"
                style={{ width: '38px', height: '38px' }}
              >
                {darkMode ? <i className="bi bi-sun-fill text-warning fs-6"></i> : <i className="bi bi-moon-stars-fill text-dark fs-6"></i>}
              </button>
            </li>

            {/* Auth Action Button - Dynamic Yellow/Gold Style */}
            <li className="nav-item ms-lg-2">
              {token ? (
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-warning small me-1">
                    <i className="bi bi-person-circle me-1"></i>
                    {user.name || 'User'}
                  </span>
                  <button 
                    onClick={handleLogout} 
                    className="btn btn-outline-warning btn-sm fw-bold px-3 py-2 rounded-pill shadow-sm"
                  >
                    Logout <i className="bi bi-box-arrow-right ms-1"></i>
                  </button>
                </div>
              ) : (
                <Link className="btn btn-warning btn-sm fw-bold px-4 py-2 rounded-pill shadow-sm text-dark" to="/login">
                  Login
                </Link>
              )}
            </li>
          </ul>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
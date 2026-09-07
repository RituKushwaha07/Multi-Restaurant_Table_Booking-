import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/register', formData);
      toast.success('Account created successfully! Please login 🎉');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light px-3">
      <div className="card shadow-lg border-0 overflow-hidden" style={{ maxWidth: '900px', width: '100%', borderRadius: '20px' }}>
        <div className="row g-0 align-items-stretch">
          
          {/* LEFT SIDE: Image Column (Same exact dimensions as Login) */}
          <div className="col-md-6 d-none d-md-block position-relative">
            <img 
              src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" 
              alt="Delicious Food" 
              className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
            />
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1))' }}></div>
            <div className="position-absolute bottom-0 start-0 p-4 text-white">
              <h4 className="fw-bold mb-1 text-warning">Join RestroApp</h4>
              <p className="small m-0 text-light opacity-75">Create an account to book tables & order delicious food online.</p>
            </div>
          </div>

          {/* RIGHT SIDE: Form Column */}
          <div className="col-md-6 p-4 p-lg-4 d-flex flex-column justify-content-center bg-white">
            <div className="text-center mb-3">
              <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-1 shadow-sm" style={{ width: '55px', height: '55px' }}>
                <i className="bi bi-person-plus-fill fs-3"></i>
              </div>
              <h4 className="fw-bold m-0">Create Account</h4>
              <p className="text-muted small m-0">Join us to book tables and order food</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-2">
                <label className="form-label fw-semibold small mb-1">Full Name</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    name="name"
                    className="form-control border-start-0 ps-0"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold small mb-1">Email Address</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    className="form-control border-start-0 ps-0"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-semibold small mb-1">Phone Number</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-telephone"></i>
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control border-start-0 ps-0"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold small mb-1">Password</label>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light text-muted border-end-0">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-control border-start-0 border-end-0 ps-0"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'} text-warning`}></i>
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-warning w-100 py-2 fw-bold rounded-pill shadow-sm text-dark mb-2" 
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Sign Up
              </button>
            </form>

            <div className="text-center mt-1 pt-2 border-top">
              <span className="text-muted small">Already have an account? </span>
              <Link to="/login" className="text-warning fw-bold text-decoration-none small">
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
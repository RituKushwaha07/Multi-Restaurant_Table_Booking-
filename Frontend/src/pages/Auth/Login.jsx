import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      toast.success('Login Successful! Welcome back 👋');
      navigate('/menu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center align-items-center min-vh-75 py-5">
      <div className="col-md-5 col-lg-4">
        <div className="card custom-card p-4 shadow-lg border-0">
          
          {/* Header & Logo Icon */}
          <div className="text-center mb-4">
            <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: '60px', height: '60px' }}>
              <i className="bi bi-person-fill fs-2"></i>
            </div>
            <h3 className="fw-bold m-0">Welcome Back</h3>
            <p className="text-muted small">Sign in to book tables & order delicious food</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold small">Email Address</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
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

            <div className="mb-4">
              <label className="form-label fw-semibold small">Password</label>
              <div className="input-group">
                <span className="input-group-text bg-transparent border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  className="form-control border-start-0 ps-0"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-brand w-100 py-2 rounded-pill shadow-sm mb-3" disabled={loading}>
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              ) : (
                <i className="bi bi-box-arrow-in-right me-2"></i>
              )}
              Sign In
            </button>
          </form>

          <div className="text-center mt-3 pt-3 border-top">
            <span className="text-muted small">Don't have an account? </span>
            <Link to="/register" className="text-brand fw-bold text-decoration-none small">
              Register Here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
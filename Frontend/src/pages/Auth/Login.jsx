import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      toast.success('Login Successful! Welcome back 👋');
      navigate('/menu');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light px-3">
      <div className="card shadow-lg border-0 overflow-hidden" style={{ maxWidth: '900px', width: '100%', borderRadius: '20px' }}>
        <div className="row g-0 align-items-stretch">
          
          {/* LEFT SIDE: Image Column (Exact Match) */}
          <div className="col-md-6 d-none d-md-block position-relative">
            <img 
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80" 
              alt="Restaurant Dining" 
              className="w-100 h-100 object-fit-cover position-absolute top-0 start-0"
            />
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1))' }}></div>
            <div className="position-absolute bottom-0 start-0 p-4 text-white">
              <h4 className="fw-bold mb-1 text-warning">Delicious Dining Awaits</h4>
              <p className="small m-0 text-light opacity-75">Reserve your table and order your favorite meals with ease.</p>
            </div>
          </div>

          {/* RIGHT SIDE: Form Column */}
          <div className="col-md-6 p-4 p-lg-5 d-flex flex-column justify-content-center bg-white">
            <div className="text-center mb-4">
              <div className="bg-warning text-dark rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow-sm" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-person-fill fs-3"></i>
              </div>
              <h3 className="fw-bold m-0">Welcome Back</h3>
              <p className="text-muted small">Sign in to continue to RestroApp</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold small">Email Address</label>
                <div className="input-group">
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

              <div className="mb-4">
                <label className="form-label fw-semibold small">Password</label>
                <div className="input-group">
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
                className="btn btn-warning w-100 py-2.5 fw-bold rounded-pill shadow-sm text-dark mb-3" 
                disabled={loading}
              >
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-box-arrow-in-right me-2"></i>}
                Sign In
              </button>
            </form>

            <div className="text-center mt-2 pt-3 border-top">
              <span className="text-muted small">Don't have an account? </span>
              <Link to="/register" className="text-warning fw-bold text-decoration-none small">
                Register Here
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
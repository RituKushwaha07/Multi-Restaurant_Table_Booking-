import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';

const TableBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bookingDate: '',
    bookingTime: '',
    guests: 2,
    specialRequest: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/bookings', formData);
      toast.success('Table reserved successfully! 🍽️');
      navigate('/my-bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reserve table.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-md-8 col-lg-6">
        <div className="card custom-card p-4 shadow-lg border-0">
          <div className="text-center mb-4">
            <i className="bi bi-calendar-check text-warning display-4"></i>
            <h3 className="fw-bold mt-2">Book a Table</h3>
            <p className="text-muted small">Reserve your dining spot in advance</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Date</label>
                <input
                  type="date"
                  name="bookingDate"
                  className="form-control"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Time</label>
                <input
                  type="time"
                  name="bookingTime"
                  className="form-control"
                  value={formData.bookingTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-12">
                <label className="form-label fw-semibold small">Number of Guests</label>
                <select
                  name="guests"
                  className="form-select"
                  value={formData.guests}
                  onChange={handleChange}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-12">
                <label className="form-label fw-semibold small">Special Requests (Optional)</label>
                <textarea
                  name="specialRequest"
                  className="form-control"
                  rows="3"
                  placeholder="e.g. Birthday decoration, quiet table..."
                  value={formData.specialRequest}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <button type="submit" className="btn btn-brand w-100 py-2 rounded-pill shadow-sm mt-4" disabled={loading}>
              {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
              Confirm Reservation
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TableBooking;
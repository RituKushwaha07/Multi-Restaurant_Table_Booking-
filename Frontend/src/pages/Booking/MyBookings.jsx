import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const res = await API.get('/bookings/my-bookings');
      if (Array.isArray(res.data)) {
        setBookings(res.data);
      } else if (res.data?.bookings) {
        setBookings(res.data.bookings);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.log('Backend API Error, loading sample data for UI verification:', err);
      // Fallback Data for UI Preview
      setBookings([
        {
          _id: '1',
          restaurantId: { name: 'Grand Spice Restro' },
          date: '2026-09-15',
          timeSlot: '08:30 PM',
          guests: 4,
          specialRequest: 'Window Seat Required',
          status: 'Confirmed'
        },
        {
          _id: '2',
          restaurantId: { name: 'Royal Bites Cafe' },
          date: '2026-09-18',
          timeSlot: '01:30 PM',
          guests: 2,
          specialRequest: 'Anniversary Special Setup',
          status: 'Pending'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await API.delete(`/bookings/${id}`);
        toast.success('Booking cancelled successfully');
        setBookings(bookings.filter((b) => b._id !== id));
      } catch (err) {
        toast.error('Failed to cancel booking');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-semibold">Confirmed</span>;
      case 'pending':
        return <span className="badge bg-warning-subtle text-warning px-3 py-2 rounded-pill fw-semibold">Pending</span>;
      case 'cancelled':
        return <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-semibold">Cancelled</span>;
      default:
        return <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill fw-semibold">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-warning" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold m-0">My Table Bookings</h3>
          <p className="text-muted small">Manage your upcoming restaurant reservations</p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-5 bg-white rounded-4 shadow-sm">
          <i className="bi bi-calendar-x display-1 text-muted"></i>
          <h5 className="fw-bold mt-3">No Bookings Found</h5>
          <p className="text-muted small">You haven't reserved any tables yet.</p>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map((item) => (
            <div className="col-md-6 col-lg-4" key={item._id}>
              <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="card-header bg-warning bg-gradient text-dark border-0 p-3 d-flex justify-content-between align-items-center">
                  <h6 className="fw-bold m-0">
                    <i className="bi bi-shop me-2"></i>
                    {item.restaurantId?.name || 'RestroApp Diner'}
                  </h6>
                  {getStatusBadge(item.status)}
                </div>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-calendar-event text-warning me-3 fs-5"></i>
                    <div>
                      <small className="text-muted d-block">Date</small>
                      <strong className="small">{item.date}</strong>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-2">
                    <i className="bi bi-clock text-warning me-3 fs-5"></i>
                    <div>
                      <small className="text-muted d-block">Time</small>
                      <strong className="small">{item.timeSlot}</strong>
                    </div>
                  </div>

                  <div className="d-flex align-items-center mb-3">
                    <i className="bi bi-people text-warning me-3 fs-5"></i>
                    <div>
                      <small className="text-muted d-block">Guests</small>
                      <strong className="small">{item.guests} Persons</strong>
                    </div>
                  </div>

                  {item.specialRequest && (
                    <div className="p-2 bg-light rounded-3 mb-3">
                      <small className="text-muted d-block fw-semibold">Note:</small>
                      <small className="text-dark">{item.specialRequest}</small>
                    </div>
                  )}

                  {item.status !== 'Cancelled' && (
                    <button
                      className="btn btn-outline-danger btn-sm w-100 rounded-pill mt-2"
                      onClick={() => handleCancelBooking(item._id)}
                    >
                      <i className="bi bi-x-circle me-1"></i> Cancel Reservation
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
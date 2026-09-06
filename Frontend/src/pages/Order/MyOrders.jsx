import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import API from '../../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetching order list
      const res = await API.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not fetch your orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      case 'PREPARING':
        return 'bg-warning text-dark';
      default:
        return 'bg-info text-dark';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-warning" role="status"></div>
        <p className="mt-2 text-muted">Fetching your delicious orders...</p>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <h3 className="fw-bold mb-4">
        <i className="bi bi-bag-check text-warning me-2"></i>My Orders
      </h3>

      {orders.length === 0 ? (
        <div className="card custom-card p-5 text-center shadow-sm">
          <i className="bi bi-receipt text-muted display-1"></i>
          <h5 className="mt-3">No Orders Placed Yet</h5>
          <p className="text-muted">Looks like you haven't ordered anything from our menu.</p>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div className="col-md-6" key={order._id}>
              <div className="card custom-card p-4 shadow-sm border-0 h-100">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-muted small">ID: #{order._id.slice(-6)}</span>
                  <span className={`badge ${getStatusBadge(order.orderStatus)} rounded-pill px-3 py-2`}>
                    {order.orderStatus || 'PENDING'}
                  </span>
                </div>

                <h5 className="fw-bold mb-1">
                  {order.restaurantId?.name || 'Restaurant'}
                </h5>
                <p className="text-muted small mb-3">
                  <i className="bi bi-geo-alt me-1"></i>{order.restaurantId?.city || 'Location'}
                </p>

                <hr className="my-2" />

                {/* Items List */}
                <div className="my-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between small mb-1">
                      <span>{item.quantity}x {item.itemName}</span>
                      <span className="fw-semibold">₹{item.total || item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <hr className="my-2" />

                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <span className="text-muted small">Total Paid: </span>
                    <span className="fs-5 fw-bold text-brand">₹{order.totalAmount}</span>
                  </div>
                  <small className="text-muted">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Cart state passed via location state or localStorage
  const cartItems = location.state?.cartItems || [];
  const restaurantId = location.state?.restaurantId || "";
  const bookingId = location.state?.bookingId || null;

  const [specialInstruction, setSpecialInstruction] = useState("");
  const [loading, setLoading] = useState(false);

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!restaurantId) {
      toast.error("Restaurant selection missing!");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    setLoading(true);

    // Backend orderController expectation matching payload
    const payload = {
      restaurantId,
      bookingId: bookingId || undefined,
      items: cartItems.map(item => ({
        menuItemId: item._id || item.menuItemId,
        quantity: item.quantity
      })),
      specialInstruction
    };

    try {
      const res = await API.post('/orders', payload);
      if (res.data.success) {
        toast.success('Order placed successfully! 🍕');
        navigate('/my-orders');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center py-4">
      <div className="col-lg-8">
        <div className="card custom-card p-4 shadow-lg border-0">
          <h3 className="fw-bold mb-4">
            <i className="bi bi-cart-check text-warning me-2"></i>Checkout Summary
          </h3>

          {cartItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart-x text-muted display-1"></i>
              <p className="mt-3 text-muted">No items in your checkout list.</p>
              <button className="btn btn-brand rounded-pill px-4" onClick={() => navigate('/menu')}>
                Browse Menu
              </button>
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder}>
              {/* Items Table */}
              <div className="table-responsive mb-4">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr key={index}>
                        <td className="fw-semibold">{item.itemName}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">₹{item.price}</td>
                        <td className="text-end fw-bold">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Special Instructions */}
              <div className="mb-4">
                <label className="form-label fw-semibold small">Special Instructions for Chef</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder="e.g. Less spicy, extra sauce..."
                  value={specialInstruction}
                  onChange={(e) => setSpecialInstruction(e.target.value)}
                ></textarea>
              </div>

              {/* Amount Breakdown */}
              <div className="card bg-body-tertiary p-3 mb-4 border-0 rounded-3">
                <div className="d-flex justify-content-between fs-5 fw-bold">
                  <span>Grand Total</span>
                  <span className="text-brand">₹{calculateTotal()}</span>
                </div>
              </div>

              <button type="submit" className="btn btn-brand w-100 py-3 rounded-pill shadow-sm fw-bold" disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                Place Order Now
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
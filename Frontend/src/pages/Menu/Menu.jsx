import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../services/api';

const Menu = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        API.get('/menu-categories'),
        API.get('/menu-items')
      ]);

      // Extract data array safely from backend API response format
      const loadedCategories = catRes.data?.data || catRes.data || [];
      const loadedItems = itemRes.data?.data || itemRes.data || [];

      setCategories(loadedCategories);
      setMenuItems(loadedItems);
    } catch (err) {
      console.log("Backend API offline, using fallback menu items", err);
      
      // Fallback Demo Data for local UI testing
      setCategories([
        { _id: 'cat1', categoryName: 'Starters' },
        { _id: 'cat2', categoryName: 'Main Course' },
        { _id: 'cat3', categoryName: 'Desserts & Beverages' }
      ]);

      setMenuItems([
        { _id: 'm1', itemName: 'Paneer Tikka', price: 280, isVeg: true, categoryId: 'cat1', description: 'Grilled cottage cheese with aromatic spices' },
        { _id: 'm2', itemName: 'Crispy Corn', price: 220, isVeg: true, categoryId: 'cat1', description: 'Fried sweet corn tossed with capsicum and spices' },
        { _id: 'm3', itemName: 'Butter Chicken', price: 380, isVeg: false, categoryId: 'cat2', description: 'Tender chicken cooked in rich tomato and butter gravy' },
        { _id: 'm4', itemName: 'Dal Makhani', price: 260, isVeg: true, categoryId: 'cat2', description: 'Black lentils simmered overnight with butter and cream' },
        { _id: 'm5', itemName: 'Sizzling Brownie', price: 180, isVeg: true, categoryId: 'cat3', description: 'Warm chocolate brownie served with vanilla ice cream' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Add Item to Cart
  const addToCart = (item) => {
    const existing = cart.find((c) => c._id === item._id);
    if (existing) {
      setCart(
        cart.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast.info(`${item.itemName || item.name} added to cart! 🛒`);
  };

  // Remove / Decrease Quantity from Cart
  const removeFromCart = (item) => {
    const existing = cart.find((c) => c._id === item._id);
    if (!existing) return;

    if (existing.quantity === 1) {
      setCart(cart.filter((c) => c._id !== item._id));
      toast.warn(`${item.itemName || item.name} removed from cart`);
    } else {
      setCart(
        cart.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity - 1 } : c
        )
      );
    }
  };

  // Total Calculation
  const totalAmount = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);

  // Filter Items by Category
  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter((item) => {
        const catId = item.categoryId?._id || item.categoryId || item.category;
        return catId === selectedCategory;
      });

  // Navigate to Checkout Screen
  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    const restaurantId = cart[0]?.restaurantId?._id || cart[0]?.restaurantId || "";

    navigate('/checkout', {
      state: {
        cartItems: cart,
        restaurantId: restaurantId
      }
    });
  };

  return (
    <div className="container py-4">
      <div className="row">
        
        {/* Left Side: Menu Categories & Items */}
        <div className="col-lg-8">
          <h2 className="fw-bold mb-3">
            <i className="bi bi-book text-brand me-2"></i>Our Food Menu
          </h2>

          {/* Category Filter Pills */}
          <div className="d-flex gap-2 mb-4 overflow-auto pb-2">
            <button
              className={`btn btn-sm rounded-pill px-3 ${selectedCategory === 'all' ? 'btn-brand' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                className={`btn btn-sm rounded-pill px-3 ${selectedCategory === cat._id ? 'btn-brand' : 'btn-outline-secondary'}`}
                onClick={() => setSelectedCategory(cat._id)}
              >
                {cat.categoryName || cat.name}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-brand" role="status"></div>
            </div>
          ) : (
            <div className="row g-3">
              {filteredItems.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                  No dishes available in this category.
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div className="col-md-6" key={item._id}>
                    <div className="card custom-card h-100 p-3 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="fw-bold m-0">{item.itemName || item.name}</h5>
                          <span className={`badge ${item.isVeg ? 'bg-success' : 'bg-danger'}`}>
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </div>
                        <p className="text-muted small mb-2">{item.description}</p>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                        <span className="fw-bold fs-5 text-brand">₹{item.price}</span>
                        <button
                          className="btn btn-outline-warning btn-sm fw-semibold rounded-pill px-3"
                          onClick={() => addToCart(item)}
                        >
                          <i className="bi bi-plus-lg me-1"></i> Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Right Side: Order Summary / Cart */}
        <div className="col-lg-4 mt-4 mt-lg-0">
          <div className="card custom-card p-3 sticky-top" style={{ top: '90px' }}>
            <h4 className="fw-bold border-bottom pb-2">
              <i className="bi bi-cart3 text-brand me-2"></i>Your Cart
            </h4>

            {cart.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="bi bi-bag-x fs-1 mb-2 d-block"></i>
                Cart is empty. Add items from the menu.
              </div>
            ) : (
              <div>
                <div className="my-3" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {cart.map((c) => (
                    <div key={c._id} className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                      <div>
                        <span className="fw-semibold d-block">{c.itemName || c.name}</span>
                        <small className="text-muted">₹{c.price} x {c.quantity}</small>
                      </div>
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-danger" onClick={() => removeFromCart(c)}>-</button>
                        <span className="btn btn-light disabled px-3 text-dark fw-bold">{c.quantity}</span>
                        <button className="btn btn-outline-success" onClick={() => addToCart(c)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                    <span>Total Amount:</span>
                    <span className="text-brand">₹{totalAmount}</span>
                  </div>

                  <button 
                    onClick={handleProceedToCheckout} 
                    className="btn btn-brand w-100 py-2 fw-bold shadow-sm"
                  >
                    Proceed to Checkout <i className="bi bi-arrow-right ms-1"></i>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Menu;
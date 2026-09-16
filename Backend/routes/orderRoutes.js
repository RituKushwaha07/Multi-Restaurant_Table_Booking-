const express = require("express");

const router = express.Router();

const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ==========================================
// CREATE ORDER
// Customer
// ==========================================

router.post(
  "/",
  protect,
  authorize("CUSTOMER"),
  createOrder
);

// ==========================================
// GET ALL ORDERS
// Admin / Owner / Manager
// ==========================================

router.get(
  "/",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  getAllOrders
);

// ==========================================
// GET ORDER BY ID
// ==========================================

router.get(
  "/:id",
  protect,
  getOrderById
);

// ==========================================
// UPDATE ORDER
// Admin / Owner / Manager
// ==========================================

router.put(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  updateOrder
);

// ==========================================
// DELETE ORDER
// Admin / Owner / Manager
// ==========================================

router.delete(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  deleteOrder
);

module.exports = router;
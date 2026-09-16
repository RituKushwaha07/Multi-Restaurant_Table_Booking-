const express = require("express");

const router = express.Router();

const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
} = require("../controllers/paymentController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ===============================
// CREATE PAYMENT
// ===============================
router.post(
  "/",
  protect,
  authorize("CUSTOMER"),
  createPayment
);

// ===============================
// GET ALL PAYMENTS
// ===============================
router.get(
  "/",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  getAllPayments
);

// ===============================
// GET PAYMENT BY ID
// ===============================
router.get(
  "/:id",
  protect,
  getPaymentById
);

// ===============================
// UPDATE PAYMENT
// ===============================
router.put(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER"
  ),
  updatePayment
);

// ===============================
// UPDATE PAYMENT STATUS
// ===============================
router.patch(
  "/:id/status",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER"
  ),
  updatePaymentStatus
);

// ===============================
// DELETE PAYMENT
// ===============================
router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN"),
  deletePayment
);

module.exports = router;
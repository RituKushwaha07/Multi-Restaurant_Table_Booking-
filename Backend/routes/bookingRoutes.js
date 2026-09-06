const express = require("express");

const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");


// ==========================================
// Create Booking
// Customer only
// ==========================================
router.post(
  "/",
  protect,
  authorize("CUSTOMER"),
  createBooking
);


// ==========================================
// Get All Bookings
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
  getAllBookings
);


// ==========================================
// Get Booking By ID
// ==========================================
router.get(
  "/:id",
  protect,
  getBookingById
);


// ==========================================
// Update Booking
// ==========================================
router.put(
  "/:id",
  protect,
  updateBooking
);


// ==========================================
// Delete Booking
// ==========================================
router.delete(
  "/:id",
  protect,
  deleteBooking
);


module.exports = router;
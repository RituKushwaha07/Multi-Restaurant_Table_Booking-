const express = require("express");

const router = express.Router();

const {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  cancelBooking,
  deleteBooking,
} = require("../controllers/bookingController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ======================================================
// Create Booking
// Customer only
// ======================================================

router.post(
  "/",
  protect,
  authorize("CUSTOMER"),
  createBooking
);

// ======================================================
// Get My Bookings
// Customer only
//
// IMPORTANT:
// Keep /my BEFORE /:id
// ======================================================

router.get(
  "/my",
  protect,
  authorize("CUSTOMER"),
  getMyBookings
);

// ======================================================
// Get All Bookings
//
// SUPER_ADMIN
// RESTAURANT_OWNER
// MANAGER
// ======================================================

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

// ======================================================
// Update Booking Status
//
// SUPER_ADMIN
// RESTAURANT_OWNER
// MANAGER
// ======================================================

router.put(
  "/:id/status",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  updateBookingStatus
);

// ======================================================
// Cancel Booking
//
// Customer only
//
// IMPORTANT:
// Keep /:id/cancel BEFORE /:id
// ======================================================

router.patch(
  "/:id/cancel",
  protect,
  authorize("CUSTOMER"),
  cancelBooking
);

// ======================================================
// Update Booking
//
// Customer:
// Own booking only
//
// Owner / Manager / Admin:
// Allowed according to controller authorization
// ======================================================

router.put(
  "/:id",
  protect,
  updateBooking
);

// ======================================================
// Delete Booking
//
// SUPER_ADMIN
// RESTAURANT_OWNER
// MANAGER
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  deleteBooking
);

// ======================================================
// Get Booking By ID
//
// IMPORTANT:
// Keep this AFTER specific routes
// ======================================================

router.get(
  "/:id",
  protect,
  getBookingById
);

// ======================================================
// Export Router
// ======================================================

module.exports = router;
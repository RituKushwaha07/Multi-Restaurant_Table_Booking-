const express = require("express");
const router = express.Router();

const {createBooking,getAllBookings, getMyBookings, getBookingById,updateBookingStatus,updateBooking,cancelBooking,deleteBooking,} = require("../controllers/bookingController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ==========================================
// Create Booking
// Customer only
// ==========================================
router.post("/",protect,authorize("CUSTOMER"),createBooking);

// ==========================================
// Get My Bookings
// Customer only
// IMPORTANT: Keep this BEFORE /:id
// ==========================================
router.get("/my",protect,authorize("CUSTOMER"),getMyBookings);

// ==========================================
// Get All Bookings
// Admin / Owner / Manager
// ==========================================
router.get("/",protect,authorize("SUPER_ADMIN","RESTAURANT_OWNER","MANAGER"),getAllBookings);

// ==========================================
// Get Booking By ID
// ==========================================
router.get("/:id",protect,getBookingById);



router.put("/:id/status",protect,authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),updateBookingStatus);

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


router.patch(
  "/:id/cancel",
  protect,
  authorize("CUSTOMER"),
  cancelBooking
);


module.exports = router;
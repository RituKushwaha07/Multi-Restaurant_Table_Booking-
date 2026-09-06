const express = require("express");

const router = express.Router();

const {
  createRestaurantTiming,
  getAllRestaurantTimings,
  getRestaurantTimingById,
  updateRestaurantTiming,
  deleteRestaurantTiming,
} = require("../controllers/restaurantTimingController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ==========================================
// Create Timing
// ==========================================
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  createRestaurantTiming
);

// ==========================================
// Get All Timings
// ==========================================
router.get(
  "/",
  protect,
  getAllRestaurantTimings
);

// ==========================================
// Get Timing By ID
// ==========================================
router.get(
  "/:id",
  protect,
  getRestaurantTimingById
);

// ==========================================
// Update Timing
// ==========================================
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  updateRestaurantTiming
);

// ==========================================
// Delete Timing
// ==========================================
router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  deleteRestaurantTiming
);

module.exports = router;
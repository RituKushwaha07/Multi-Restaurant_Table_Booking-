const express = require("express");

const router = express.Router();

const {createRestaurantTiming,getAllRestaurantTimings,getRestaurantTimingById,updateRestaurantTiming,deleteRestaurantTiming,} = require("../controllers/restaurantTimingController");

// ==========================================
// Middleware
// ==========================================

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ==========================================
// Create Restaurant Timing
// SUPER_ADMIN + RESTAURANT_OWNER
// ==========================================

router.post("/",protect,authorize("SUPER_ADMIN","RESTAURANT_OWNER"),createRestaurantTiming);

// ==========================================
// Get All Restaurant Timings
// Logged-in users
// ==========================================

router.get("/",protect,getAllRestaurantTimings);
router.get("/:id",protect,getRestaurantTimingById);

// ==========================================
// Update Restaurant Timing
// SUPER_ADMIN + RESTAURANT_OWNER
// ==========================================

router.put(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER"
  ),
  updateRestaurantTiming
);

// ==========================================
// Delete Restaurant Timing
// SUPER_ADMIN + RESTAURANT_OWNER
// ==========================================

router.delete(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER"
  ),
  deleteRestaurantTiming
);

// ==========================================
// Export
// ==========================================

module.exports = router;
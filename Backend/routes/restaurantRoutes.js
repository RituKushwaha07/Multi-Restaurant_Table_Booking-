const express = require("express");

const router = express.Router();

const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  approveRestaurant,
  rejectRestaurant,
  getPendingRestaurants,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ==========================================
// Create Restaurant
// SUPER_ADMIN + RESTAURANT_OWNER
// ==========================================

router.post(
  "/",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER"
  ),
  createRestaurant
);

// ==========================================
// Get Pending Restaurants
// SUPER_ADMIN Only
// IMPORTANT: This must come before /:id
// ==========================================

router.get(
  "/pending",
  protect,
  authorize("SUPER_ADMIN"),
  getPendingRestaurants
);

// ==========================================
// Approve Restaurant
// SUPER_ADMIN Only
// ==========================================

router.put(
  "/:id/approve",
  protect,
  authorize("SUPER_ADMIN"),
  approveRestaurant
);

// ==========================================
// Reject Restaurant
// SUPER_ADMIN Only
// ==========================================

router.put(
  "/:id/reject",
  protect,
  authorize("SUPER_ADMIN"),
  rejectRestaurant
);

// ==========================================
// Get All Restaurants
// Any Logged-in User
// ==========================================

router.get(
  "/",
  protect,
  getAllRestaurants
);

// ==========================================
// Update Restaurant
// SUPER_ADMIN + RESTAURANT_OWNER
// ==========================================

router.put(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER"
  ),
  updateRestaurant
);

// ==========================================
// Delete Restaurant
// SUPER_ADMIN Only
// ==========================================

router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN"),
  deleteRestaurant
);

// ==========================================
// Get Restaurant By ID
// Any Logged-in User
// IMPORTANT: Keep this LAST
// ==========================================

router.get(
  "/:id",
  protect,
  getRestaurantById
);

module.exports = router;
const express = require("express");

const router = express.Router();

const {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
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
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  createRestaurant
);

// ==========================================
// Get All Restaurants
// Any logged-in user
// ==========================================
router.get(
  "/",
  protect,
  getAllRestaurants
);

// ==========================================
// Get Restaurant By ID
// Any logged-in user
// ==========================================
router.get(
  "/:id",
  protect,
  getRestaurantById
);

// ==========================================
// Update Restaurant
// SUPER_ADMIN + RESTAURANT_OWNER + MANAGER
// ==========================================
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  updateRestaurant
);

// ==========================================
// Delete Restaurant
// SUPER_ADMIN only
// ==========================================
router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN"),
  deleteRestaurant
);

module.exports = router;
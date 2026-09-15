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
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER"
  ),
  createRestaurant
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
// Get Restaurant By ID
// Any Logged-in User
// ==========================================

router.get(
  "/:id",
  protect,
  getRestaurantById
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

module.exports = router;
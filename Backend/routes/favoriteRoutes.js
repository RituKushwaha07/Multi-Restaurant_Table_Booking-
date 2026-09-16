const express = require("express");

const router = express.Router();

const {
  addFavorite,
  getMyFavorites,
  checkFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ==========================================
// ADD RESTAURANT TO FAVORITES
// ==========================================
router.post(
  "/",
  protect,
  authorize("CUSTOMER"),
  addFavorite
);

// ==========================================
// GET MY FAVORITES
// ==========================================
router.get(
  "/my",
  protect,
  authorize("CUSTOMER"),
  getMyFavorites
);

// ==========================================
// CHECK FAVORITE
// ==========================================
router.get(
  "/check/:restaurantId",
  protect,
  authorize("CUSTOMER"),
  checkFavorite
);

// ==========================================
// REMOVE FAVORITE
// ==========================================
router.delete(
  "/:restaurantId",
  protect,
  authorize("CUSTOMER"),
  removeFavorite
);

module.exports = router;
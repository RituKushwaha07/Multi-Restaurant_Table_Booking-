const express = require("express");

const router = express.Router();

const {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByRestaurant,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// ==========================================
// CREATE REVIEW
// ==========================================
router.post(
  "/",
  protect,
  authorize("CUSTOMER"),
  createReview
);

// ==========================================
// GET ALL REVIEWS
// ==========================================
router.get(
  "/",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  getAllReviews
);

// ==========================================
// GET REVIEWS BY RESTAURANT
// ==========================================
router.get(
  "/restaurant/:restaurantId",
  protect,
  getReviewsByRestaurant
);

// ==========================================
// GET REVIEW BY ID
// ==========================================
router.get(
  "/:id",
  protect,
  getReviewById
);

// ==========================================
// UPDATE REVIEW
// ==========================================
router.put(
  "/:id",
  protect,
  authorize("CUSTOMER"),
  updateReview
);

// ==========================================
// DELETE REVIEW
// ==========================================
router.delete(
  "/:id",
  protect,
  authorize("CUSTOMER"),
  deleteReview
);

module.exports = router;
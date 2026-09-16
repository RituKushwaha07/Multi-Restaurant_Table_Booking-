const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const Booking = require("../models/Booking");

// ==========================================
// CREATE REVIEW
// ==========================================
const createReview = async (req, res) => {
  try {
    const {
      restaurantId,
      bookingId,
      rating,
      comment,
    } = req.body;

    // 1. Required fields
    if (!restaurantId || !bookingId || rating === undefined) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID, Booking ID and rating are required",
      });
    }

    // 2. Validate rating
    if (Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // 3. Check restaurant
    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or inactive",
      });
    }

    // 4. Check booking
    const booking = await Booking.findOne({
      _id: bookingId,
      customerId: req.user._id,
      restaurantId,
      isActive: true,
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 5. Customer can review only completed booking
    if (booking.bookingStatus !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Review can be added only after booking is completed",
      });
    }

    // 6. Check duplicate review
    const existingReview = await Review.findOne({
      customerId: req.user._id,
      bookingId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    // 7. Create review
    const review = await Review.create({
      restaurantId,
      customerId: req.user._id,
      bookingId,
      rating: Number(rating),
      comment: comment || "",
    });

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    console.error("Create Review Error:", error);

    // MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this booking",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// GET ALL REVIEWS
// ==========================================
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      isActive: true,
    })
      .populate("restaurantId", "name city")
      .populate("customerId", "fullName email phone")
      .populate(
        "bookingId",
        "bookingCode bookingDate bookingTime guests"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get All Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// GET REVIEW BY ID
// ==========================================
const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      _id: id,
      isActive: true,
    })
      .populate("restaurantId", "name city")
      .populate("customerId", "fullName email phone")
      .populate(
        "bookingId",
        "bookingCode bookingDate bookingTime guests"
      );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error("Get Review By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// GET REVIEWS BY RESTAURANT
// ==========================================
const getReviewsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const reviews = await Review.find({
      restaurantId,
      isActive: true,
    })
      .populate("customerId", "fullName")
      .populate(
        "bookingId",
        "bookingCode bookingDate bookingTime"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Get Restaurant Reviews Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// UPDATE REVIEW
// ==========================================
const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findOne({
      _id: id,
      isActive: true,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Only review owner can update
    if (
      review.customerId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this review",
      });
    }

    // Update rating
    if (rating !== undefined) {
      if (Number(rating) < 1 || Number(rating) > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be between 1 and 5",
        });
      }

      review.rating = Number(rating);
    }

    // Update comment
    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    console.error("Update Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// DELETE REVIEW
// ==========================================
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findOne({
      _id: id,
      isActive: true,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Only review owner can delete
    if (
      review.customerId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this review",
      });
    }

    // Soft delete
    review.isActive = false;

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete Review Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================
module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByRestaurant,
  updateReview,
  deleteReview,
};
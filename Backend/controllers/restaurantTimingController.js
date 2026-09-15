const RestaurantTiming = require("../models/RestaurantTiming");
const Restaurant = require("../models/Restaurant");

// ==========================================
// Create Restaurant Timing
// ==========================================

const createRestaurantTiming = async (req, res) => {
  try {
    const {
      restaurantId,
      day,
      openTime,
      closeTime,
      isClosed,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!restaurantId || !day) {
      return res.status(400).json({
        success: false,
        message: "Restaurant and day are required",
      });
    }

    // ==========================================
    // Check Restaurant
    // ==========================================

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==========================================
    // Ownership Check
    // ==========================================

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this restaurant",
      });
    }

    // ==========================================
    // Closed Day Validation
    // ==========================================

    if (
      isClosed !== true &&
      (!openTime || !closeTime)
    ) {
      return res.status(400).json({
        success: false,
        message: "Open time and close time are required",
      });
    }

    // ==========================================
    // Duplicate Day Check
    // ==========================================

    const existingTiming = await RestaurantTiming.findOne({
      restaurantId,
      day,
    });

    if (existingTiming) {
      return res.status(400).json({
        success: false,
        message: "Timing for this day already exists",
      });
    }

    // ==========================================
    // Create Timing
    // ==========================================

    const timing = await RestaurantTiming.create({
      restaurantId,
      day,
      openTime: isClosed === true ? "" : openTime,
      closeTime: isClosed === true ? "" : closeTime,
      isClosed: isClosed === true,
    });

    // ==========================================
    // Response
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "Restaurant timing created successfully",
      data: timing,
    });
  } catch (error) {
    console.error("Create Timing Error:", error);

    // Duplicate index error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Timing for this day already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Get All Restaurant Timings
// ==========================================

const getAllRestaurantTimings = async (req, res) => {
  try {
    const timings = await RestaurantTiming.find()
      .populate(
        "restaurantId",
        "name city"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: timings.length,
      data: timings,
    });
  } catch (error) {
    console.error(
      "Get All Timing Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Get Restaurant Timing By ID
// ==========================================

const getRestaurantTimingById = async (req, res) => {
  try {
    const { id } = req.params;

    const timing = await RestaurantTiming.findById(id)
      .populate(
        "restaurantId",
        "name city"
      );

    if (!timing) {
      return res.status(404).json({
        success: false,
        message: "Restaurant timing not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: timing,
    });
  } catch (error) {
    console.error(
      "Get Timing By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Update Restaurant Timing
// ==========================================

const updateRestaurantTiming = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // Find Timing
    // ==========================================

    const timing = await RestaurantTiming.findById(id);

    if (!timing) {
      return res.status(404).json({
        success: false,
        message: "Restaurant timing not found",
      });
    }

    // ==========================================
    // Find Restaurant
    // ==========================================

    const restaurant = await Restaurant.findById(
      timing.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==========================================
    // Ownership Check
    // ==========================================

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this timing",
      });
    }

    // ==========================================
    // Update Day
    // ==========================================

    if (req.body.day !== undefined) {
      timing.day = req.body.day;
    }

    // ==========================================
    // Update Closed Status
    // ==========================================

    if (req.body.isClosed !== undefined) {
      timing.isClosed = req.body.isClosed;
    }

    // ==========================================
    // Update Time
    // ==========================================

    if (timing.isClosed === true) {
      timing.openTime = "";
      timing.closeTime = "";
    } else {
      if (req.body.openTime !== undefined) {
        timing.openTime = req.body.openTime;
      }

      if (req.body.closeTime !== undefined) {
        timing.closeTime = req.body.closeTime;
      }

      // Time required when restaurant is open
      if (!timing.openTime || !timing.closeTime) {
        return res.status(400).json({
          success: false,
          message: "Open time and close time are required",
        });
      }
    }

    // ==========================================
    // Save
    // ==========================================

    await timing.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant timing updated successfully",
      data: timing,
    });
  } catch (error) {
    console.error(
      "Update Timing Error:",
      error
    );

    // Duplicate day
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Timing for this day already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Delete Restaurant Timing
// ==========================================

const deleteRestaurantTiming = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // Find Timing
    // ==========================================

    const timing = await RestaurantTiming.findById(id);

    if (!timing) {
      return res.status(404).json({
        success: false,
        message: "Restaurant timing not found",
      });
    }

    // ==========================================
    // Find Restaurant
    // ==========================================

    const restaurant = await Restaurant.findById(
      timing.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==========================================
    // Ownership Check
    // ==========================================

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this timing",
      });
    }

    // ==========================================
    // Delete
    // ==========================================

    await RestaurantTiming.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Restaurant timing deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Timing Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Export
// ==========================================

module.exports = {
  createRestaurantTiming,
  getAllRestaurantTimings,
  getRestaurantTimingById,
  updateRestaurantTiming,
  deleteRestaurantTiming,
};
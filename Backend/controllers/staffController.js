const User = require("../models/User");
const Restaurant = require("../models/Restaurant");

// ======================================================
// Create Manager
// POST /api/staff
// ======================================================

const createManager = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      restaurantId,
    } = req.body;

    // Basic validation
    if (!fullName || !email || !phone || !password || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check restaurant
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

    // Restaurant Owner can create manager
    // only for own restaurant
    if (
      req.user.role === "RESTAURANT_OWNER" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only create manager for your own restaurant",
      });
    }

    // Check email
    const existingEmail = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Check phone
    const existingPhone = await User.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone already registered",
      });
    }

    // Create manager
    const manager = await User.create({
      fullName,
      email: email.toLowerCase(),
      phone,
      password,
      role: "MANAGER",
      restaurantId,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: "Manager created successfully",
      data: {
        _id: manager._id,
        fullName: manager.fullName,
        email: manager.email,
        phone: manager.phone,
        role: manager.role,
        restaurantId: manager.restaurantId,
        isActive: manager.isActive,
      },
    });
  } catch (error) {
    console.error("Create Manager Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create manager",
      error: error.message,
    });
  }
};


// ======================================================
// Get All Managers
// GET /api/staff
// ======================================================

const getAllManagers = async (req, res) => {
  try {
    let filter = {
      role: "MANAGER",
      isActive: true,
    };

    // Restaurant Owner can see
    // only managers of own restaurant
    if (req.user.role === "RESTAURANT_OWNER") {
      const restaurantIds = await Restaurant.find({
        owner: req.user._id,
        isActive: true,
      }).distinct("_id");

      filter.restaurantId = {
        $in: restaurantIds,
      };
    }

    const managers = await User.find(filter)
      .select("-password")
      .populate("restaurantId", "name city cuisine")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: managers.length,
      data: managers,
    });
  } catch (error) {
    console.error("Get Managers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get managers",
      error: error.message,
    });
  }
};


// ======================================================
// Get Manager By ID
// GET /api/staff/:id
// ======================================================

const getManagerById = async (req, res) => {
  try {
    // Find manager first WITHOUT populate
    const manager = await User.findOne({
      _id: req.params.id,
      role: "MANAGER",
      isActive: true,
    }).select("-password");

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // Restaurant Owner authorization
    if (req.user.role === "RESTAURANT_OWNER") {
      const restaurant = await Restaurant.findOne({
        _id: manager.restaurantId,
        owner: req.user._id,
        isActive: true,
      });

      if (!restaurant) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    // Get manager with restaurant details
    const result = await User.findById(manager._id)
      .select("-password")
      .populate("restaurantId", "name city cuisine");

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get Manager Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get manager",
      error: error.message,
    });
  }
};


// ======================================================
// Update Manager
// PUT /api/staff/:id
// ======================================================

const updateManager = async (req, res) => {
  try {
    const manager = await User.findOne({
      _id: req.params.id,
      role: "MANAGER",
      isActive: true,
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // Restaurant Owner authorization
    if (req.user.role === "RESTAURANT_OWNER") {
      const restaurant = await Restaurant.findOne({
        _id: manager.restaurantId,
        owner: req.user._id,
        isActive: true,
      });

      if (!restaurant) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    const {
      fullName,
      phone,
      restaurantId,
    } = req.body;

    // Update full name
    if (fullName) {
      manager.fullName = fullName;
    }

    // Update phone
    if (phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: manager._id },
      });

      if (existingPhone) {
        return res.status(400).json({
          success: false,
          message: "Phone already registered",
        });
      }

      manager.phone = phone;
    }

    // Change restaurant
    if (restaurantId) {
      const restaurant = await Restaurant.findOne({
        _id: restaurantId,
        isActive: true,
      });

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found",
        });
      }

      // Owner can assign only own restaurant
      if (
        req.user.role === "RESTAURANT_OWNER" &&
        restaurant.owner.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You cannot assign manager to this restaurant",
        });
      }

      manager.restaurantId = restaurantId;
    }

    await manager.save();

    return res.status(200).json({
      success: true,
      message: "Manager updated successfully",
      data: {
        _id: manager._id,
        fullName: manager.fullName,
        email: manager.email,
        phone: manager.phone,
        role: manager.role,
        restaurantId: manager.restaurantId,
        isActive: manager.isActive,
      },
    });
  } catch (error) {
    console.error("Update Manager Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update manager",
      error: error.message,
    });
  }
};


// ======================================================
// Change Manager Status
// PATCH /api/staff/:id/status
// ======================================================

const updateManagerStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const manager = await User.findOne({
      _id: req.params.id,
      role: "MANAGER",
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // Restaurant Owner authorization
    if (req.user.role === "RESTAURANT_OWNER") {
      const restaurant = await Restaurant.findOne({
        _id: manager.restaurantId,
        owner: req.user._id,
        isActive: true,
      });

      if (!restaurant) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    manager.isActive = isActive;

    await manager.save();

    return res.status(200).json({
      success: true,
      message: "Manager status updated successfully",
      data: {
        _id: manager._id,
        fullName: manager.fullName,
        email: manager.email,
        role: manager.role,
        restaurantId: manager.restaurantId,
        isActive: manager.isActive,
      },
    });
  } catch (error) {
    console.error("Update Manager Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update manager status",
      error: error.message,
    });
  }
};


// ======================================================
// Delete Manager
// DELETE /api/staff/:id
// ======================================================

const deleteManager = async (req, res) => {
  try {
    const manager = await User.findOne({
      _id: req.params.id,
      role: "MANAGER",
    });

    if (!manager) {
      return res.status(404).json({
        success: false,
        message: "Manager not found",
      });
    }

    // Restaurant Owner authorization
    if (req.user.role === "RESTAURANT_OWNER") {
      const restaurant = await Restaurant.findOne({
        _id: manager.restaurantId,
        owner: req.user._id,
        isActive: true,
      });

      if (!restaurant) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized",
        });
      }
    }

    // Soft delete
    manager.isActive = false;

    await manager.save();

    return res.status(200).json({
      success: true,
      message: "Manager deleted successfully",
    });
  } catch (error) {
    console.error("Delete Manager Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete manager",
      error: error.message,
    });
  }
};


// ======================================================
// Export
// ======================================================

module.exports = {
  createManager,
  getAllManagers,
  getManagerById,
  updateManager,
  updateManagerStatus,
  deleteManager,
};
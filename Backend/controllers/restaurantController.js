const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

// =======================================
// Create Restaurant
// =======================================

const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      city,
      state,
      country,
      cuisine,
      images,
      owner,
    } = req.body;

    // =======================================
    // Required Fields
    // =======================================

    if (
      !name ||
      !description ||
      !address ||
      !city ||
      !state ||
      !country ||
      !cuisine
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // =======================================
    // Check Duplicate Restaurant
    // =======================================

    const existingRestaurant = await Restaurant.findOne({
      name: name.trim(),
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant already exists",
      });
    }

    let restaurantOwner;

    // =======================================
    // SUPER_ADMIN
    // =======================================

    if (req.user.role === "SUPER_ADMIN") {
      if (!owner) {
        return res.status(400).json({
          success: false,
          message: "Owner is required",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(owner)) {
        return res.status(400).json({
          success: false,
          message: "Invalid owner ID",
        });
      }

      restaurantOwner = await User.findById(owner);

      if (!restaurantOwner) {
        return res.status(404).json({
          success: false,
          message: "Restaurant owner not found",
        });
      }

      // =======================================
      // Owner Role Validation
      // =======================================

      if (restaurantOwner.role !== "RESTAURANT_OWNER") {
        return res.status(400).json({
          success: false,
          message: "Selected user is not a restaurant owner",
        });
      }

      // =======================================
      // Check Owner Already Has Restaurant
      // =======================================

      if (restaurantOwner.restaurantId) {
        return res.status(400).json({
          success: false,
          message: "This owner already has a restaurant",
        });
      }
    }

    // =======================================
    // RESTAURANT_OWNER
    // =======================================

    if (req.user.role === "RESTAURANT_OWNER") {
      // One owner = one restaurant
      if (req.user.restaurantId) {
        return res.status(400).json({
          success: false,
          message: "You already have a restaurant",
        });
      }

      restaurantOwner = req.user;
    }

    // =======================================
    // Safety Check
    // =======================================

    if (!restaurantOwner) {
      return res.status(400).json({
        success: false,
        message: "Restaurant owner is required",
      });
    }

    // =======================================
    // Create Restaurant
    // New Restaurant = PENDING
    // =======================================

    const restaurant = await Restaurant.create({
      name: name.trim(),
      description: description.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country: country.trim(),
      cuisine: cuisine.trim(),
      images: images || [],
      owner: restaurantOwner._id,

      // Approval System
      approvalStatus: "PENDING",
      rejectionReason: "",
      approvedAt: null,
      approvedBy: null,

      // Active
      isActive: true,
    });

    // =======================================
    // Update User restaurantId
    // =======================================

    await User.findByIdAndUpdate(
      restaurantOwner._id,
      {
        restaurantId: restaurant._id,
      }
    );

    // =======================================
    // Response
    // =======================================

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully and is pending approval",
      data: restaurant,
    });
  } catch (error) {
    console.error("Create Restaurant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================
// Get All Restaurants
// =======================================

const getAllRestaurants = async (req, res) => {
  try {
    let query = {};

    // =======================================
    // CUSTOMER
    // Only APPROVED + ACTIVE restaurants
    // =======================================

    if (req.user.role === "CUSTOMER") {
      query = {
        approvalStatus: "APPROVED",
        isActive: true,
      };
    }

    // =======================================
    // SUPER_ADMIN
    // Can see everything
    // =======================================

    if (req.user.role === "SUPER_ADMIN") {
      query = {};
    }

    // =======================================
    // RESTAURANT_OWNER
    // Only own restaurant
    // =======================================

    if (req.user.role === "RESTAURANT_OWNER") {
      query = {
        owner: req.user._id,
      };
    }

    // =======================================
    // MANAGER
    // Own restaurant
    // =======================================

    if (req.user.role === "MANAGER") {
      query = {
        _id: req.user.restaurantId,
      };
    }

    const restaurants = await Restaurant.find(query)
      .populate(
        "owner",
        "fullName email phone role"
      )
      .populate(
        "approvedBy",
        "fullName email role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Get All Restaurants Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================
// Get Restaurant By ID
// =======================================

const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    // =======================================
    // Validate ID
    // =======================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    const restaurant = await Restaurant.findById(id)
      .populate(
        "owner",
        "fullName email phone role"
      )
      .populate(
        "approvedBy",
        "fullName email role"
      );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // =======================================
    // CUSTOMER
    // Only approved + active restaurant
    // =======================================

    if (
      req.user.role === "CUSTOMER" &&
      (
        restaurant.approvalStatus !== "APPROVED" ||
        !restaurant.isActive
      )
    ) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // =======================================
    // RESTAURANT_OWNER
    // Only own restaurant
    // =======================================

    if (
      req.user.role === "RESTAURANT_OWNER" &&
      restaurant.owner._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this restaurant",
      });
    }

    // =======================================
    // MANAGER
    // Only own restaurant
    // =======================================

    if (
      req.user.role === "MANAGER" &&
      (!req.user.restaurantId ||
        restaurant._id.toString() !== req.user.restaurantId.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this restaurant",
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Get Restaurant By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================
// Update Restaurant
// =======================================

const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      address,
      city,
      state,
      country,
      cuisine,
      images,
    } = req.body;

    // =======================================
    // Validate ID
    // =======================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    // =======================================
    // Find Restaurant
    // =======================================

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // =======================================
    // Ownership Check
    // =======================================

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this restaurant",
      });
    }

    // =======================================
    // Check Duplicate Name
    // =======================================

    if (name && name.trim() !== restaurant.name) {
      const existingRestaurant = await Restaurant.findOne({
        name: name.trim(),
        _id: { $ne: id },
      });

      if (existingRestaurant) {
        return res.status(400).json({
          success: false,
          message: "Restaurant name already exists",
        });
      }
    }

    // =======================================
    // Update Fields
    // =======================================

    if (name) {
      restaurant.name = name.trim();
    }

    if (description) {
      restaurant.description = description.trim();
    }

    if (address) {
      restaurant.address = address.trim();
    }

    if (city) {
      restaurant.city = city.trim();
    }

    if (state) {
      restaurant.state = state.trim();
    }

    if (country) {
      restaurant.country = country.trim();
    }

    if (cuisine) {
      restaurant.cuisine = cuisine.trim();
    }

    if (images) {
      restaurant.images = images;
    }

    // =======================================
    // Save Updated Restaurant
    // =======================================

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("Update Restaurant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================
// Approve Restaurant
// SUPER_ADMIN only
// =======================================

const approveRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // =======================================
    // Validate ID
    // =======================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    // =======================================
    // Find Restaurant
    // =======================================

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // =======================================
    // Already Approved
    // =======================================

    if (restaurant.approvalStatus === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Restaurant is already approved",
      });
    }

    // =======================================
    // Approve Restaurant
    // =======================================

    restaurant.approvalStatus = "APPROVED";
    restaurant.rejectionReason = "";
    restaurant.approvedAt = new Date();
    restaurant.approvedBy = req.user._id;
    restaurant.isActive = true;

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant approved successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("Approve Restaurant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================
// Reject Restaurant
// SUPER_ADMIN only
// =======================================

const rejectRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    // =======================================
    // Validate ID
    // =======================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    // =======================================
    // Rejection Reason Required
    // =======================================

    if (!rejectionReason || !rejectionReason.trim()) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required",
      });
    }

    // =======================================
    // Find Restaurant
    // =======================================

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // =======================================
    // Already Rejected
    // =======================================

    if (restaurant.approvalStatus === "REJECTED") {
      return res.status(400).json({
        success: false,
        message: "Restaurant is already rejected",
      });
    }

    // =======================================
    // Reject Restaurant
    // =======================================

    restaurant.approvalStatus = "REJECTED";
    restaurant.rejectionReason = rejectionReason.trim();
    restaurant.approvedAt = null;
    restaurant.approvedBy = null;
    restaurant.isActive = false;

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant rejected successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("Reject Restaurant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================
// Get Pending Restaurants
// SUPER_ADMIN only
// =======================================

const getPendingRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      approvalStatus: "PENDING",
    })
      .populate(
        "owner",
        "fullName email phone role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error("Get Pending Restaurants Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================
// Delete Restaurant
// SUPER_ADMIN only
// =======================================

const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    // =======================================
    // Validate ID
    // =======================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    // =======================================
    // Find Restaurant
    // =======================================

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // =======================================
    // Delete Restaurant
    // =======================================

    await Restaurant.findByIdAndDelete(id);

    // =======================================
    // Remove restaurantId From Owner
    // =======================================

    await User.findByIdAndUpdate(
      restaurant.owner,
      {
        restaurantId: null,
      }
    );

    // =======================================
    // Response
    // =======================================

    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("Delete Restaurant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// =======================================
// Export Controllers
// =======================================

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  approveRestaurant,
  rejectRestaurant,
  getPendingRestaurants,
  deleteRestaurant,
};
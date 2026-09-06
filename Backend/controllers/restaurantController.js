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
    const existingRestaurant = await Restaurant.findOne({ name });

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

      restaurantOwner = await User.findById(owner);

      if (!restaurantOwner) {
        return res.status(404).json({
          success: false,
          message: "Restaurant owner not found",
        });
      }

      // Owner role validation
      if (
        restaurantOwner.role !== "RESTAURANT_OWNER" &&
        restaurantOwner.role !== "SUPER_ADMIN"
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid owner role",
        });
      }
    }

    // =======================================
    // RESTAURANT_OWNER
    // =======================================
    if (req.user.role === "RESTAURANT_OWNER") {
      restaurantOwner = req.user;
    }

    // =======================================
    // Create Restaurant
    // =======================================
    const restaurant = await Restaurant.create({
      name,
      description,
      address,
      city,
      state,
      country,
      cuisine,
      images,
      owner: restaurantOwner._id,
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

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
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
    const restaurants = await Restaurant.find()
      .populate(
        "owner",
        "fullName email phone role"
      )
      .sort({ createdAt: -1 });

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

    const restaurant = await Restaurant.findById(id)
      .populate(
        "owner",
        "fullName email phone role"
      );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
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
    // Update Fields
    // =======================================
    restaurant.name =
      name || restaurant.name;

    restaurant.description =
      description || restaurant.description;

    restaurant.address =
      address || restaurant.address;

    restaurant.city =
      city || restaurant.city;

    restaurant.state =
      state || restaurant.state;

    restaurant.country =
      country || restaurant.country;

    restaurant.cuisine =
      cuisine || restaurant.cuisine;

    restaurant.images =
      images || restaurant.images;

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
// Delete Restaurant
// SUPER_ADMIN only
// =======================================
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

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
    // Remove restaurantId from Owner
    // =======================================
    await User.findByIdAndUpdate(
      restaurant.owner,
      {
        restaurantId: null,
      }
    );

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


module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
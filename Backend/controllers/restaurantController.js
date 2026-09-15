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

module.exports = {createRestaurant,getAllRestaurants,getRestaurantById,updateRestaurant,deleteRestaurant,};
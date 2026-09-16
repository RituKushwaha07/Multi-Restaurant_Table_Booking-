const Favorite = require("../models/Favorite");
const Restaurant = require("../models/Restaurant");

// ==========================================
// ADD RESTAURANT TO FAVORITES
// ==========================================
const addFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.body;

    // 1. Restaurant ID required
    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    // 2. Check restaurant
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

    // 3. Check existing favorite
    const existingFavorite = await Favorite.findOne({
      customerId: req.user._id,
      restaurantId,
    });

    if (existingFavorite) {
      // If previously soft deleted, reactivate it
      if (!existingFavorite.isActive) {
        existingFavorite.isActive = true;
        await existingFavorite.save();

        return res.status(200).json({
          success: true,
          message: "Restaurant added to favorites successfully",
          data: existingFavorite,
        });
      }

      return res.status(400).json({
        success: false,
        message: "Restaurant is already in your favorites",
      });
    }

    // 4. Create favorite
    const favorite = await Favorite.create({
      customerId: req.user._id,
      restaurantId,
    });

    return res.status(201).json({
      success: true,
      message: "Restaurant added to favorites successfully",
      data: favorite,
    });
  } catch (error) {
    console.error("Add Favorite Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is already in your favorites",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// GET MY FAVORITES
// ==========================================
const getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({
      customerId: req.user._id,
      isActive: true,
    })
      .populate(
        "restaurantId",
        "name description address city state country cuisine images"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error("Get My Favorites Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// CHECK FAVORITE
// ==========================================
const checkFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const favorite = await Favorite.findOne({
      customerId: req.user._id,
      restaurantId,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      isFavorite: !!favorite,
    });
  } catch (error) {
    console.error("Check Favorite Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// REMOVE FAVORITE
// ==========================================
const removeFavorite = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const favorite = await Favorite.findOne({
      customerId: req.user._id,
      restaurantId,
      isActive: true,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Restaurant is not in your favorites",
      });
    }

    // Soft delete
    favorite.isActive = false;

    await favorite.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant removed from favorites successfully",
    });
  } catch (error) {
    console.error("Remove Favorite Error:", error);

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
  addFavorite,
  getMyFavorites,
  checkFavorite,
  removeFavorite,
};
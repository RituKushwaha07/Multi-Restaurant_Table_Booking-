const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const MenuCategory = require("../models/MenuCategory");

// ==========================================
// Create Menu Item
// ==========================================
const createMenuItem = async (req, res) => {
  try {
    const {
      restaurantId,
      categoryId,
      itemName,
      description,
      price,
      image,
      isVeg,
      preparationTime,
      isAvailable,
      isRecommended,
    } = req.body;

    // Validation
    if (!restaurantId || !categoryId || !itemName || price == null) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant, Category, Item Name and Price are required",
      });
    }

    // Check Restaurant
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Check Category
    const category = await MenuCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Menu Category not found",
      });
    }

    // Duplicate Item Check
    const existingItem = await MenuItem.findOne({
      restaurantId,
      categoryId,
      itemName,
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Menu Item already exists",
      });
    }

    // Create Item
    const item = await MenuItem.create({
      restaurantId,
      categoryId,
      itemName,
      description,
      price,
      image,
      isVeg,
      preparationTime,
      isAvailable,
      isRecommended,
    });

    return res.status(201).json({
      success: true,
      message: "Menu Item created successfully",
      data: item,
    });
  } catch (error) {
    console.error("Create Menu Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Get All Menu Items
// ==========================================
const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find()
      .populate("restaurantId", "name city")
      .populate("categoryId", "categoryName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Get Menu Items Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Get Menu Item By ID
// ==========================================
const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findById(id)
      .populate("restaurantId", "name city")
      .populate("categoryId", "categoryName");

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu Item not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Get Menu Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Update Menu Item
// ==========================================
const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu Item not found",
      });
    }

    item.itemName = req.body.itemName || item.itemName;
    item.description = req.body.description || item.description;

    if (req.body.price !== undefined) {
      item.price = req.body.price;
    }

    item.image = req.body.image || item.image;

    if (req.body.isVeg !== undefined) {
      item.isVeg = req.body.isVeg;
    }

    if (req.body.preparationTime !== undefined) {
      item.preparationTime = req.body.preparationTime;
    }

    if (req.body.isAvailable !== undefined) {
      item.isAvailable = req.body.isAvailable;
    }

    if (req.body.isRecommended !== undefined) {
      item.isRecommended = req.body.isRecommended;
    }

    if (req.body.isActive !== undefined) {
      item.isActive = req.body.isActive;
    }

    await item.save();

    return res.status(200).json({
      success: true,
      message: "Menu Item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error("Update Menu Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Delete Menu Item
// ==========================================
const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu Item not found",
      });
    }

    await MenuItem.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Menu Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Menu Item Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
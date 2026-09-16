const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const MenuCategory = require("../models/MenuCategory");


// =====================================================
// CREATE MENU ITEM
// =====================================================

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


    // 1. Basic validation
    if (
      !restaurantId ||
      !categoryId ||
      !itemName ||
      price === undefined ||
      price === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant, Category, Item Name and Price are required",
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


    // 3. Ownership check
    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this restaurant",
      });
    }


    // 4. Check category
    const category = await MenuCategory.findOne({
      _id: categoryId,
      restaurantId: restaurantId,
      isActive: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message:
          "Menu Category not found or does not belong to this restaurant",
      });
    }


    // 5. Validate price
    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price cannot be negative",
      });
    }


    // 6. Duplicate item check
    const existingItem = await MenuItem.findOne({
      restaurantId,
      categoryId,
      itemName: itemName.trim(),
    });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Menu Item already exists",
      });
    }


    // 7. Create item
    const item = await MenuItem.create({
      restaurantId,
      categoryId,
      itemName: itemName.trim(),
      description,
      price,
      image,
      isVeg,
      preparationTime,
      isAvailable,
      isRecommended,
    });


    // 8. Response
    return res.status(201).json({
      success: true,
      message: "Menu Item created successfully",
      data: item,
    });

  } catch (error) {
    console.error("Create Menu Item Error:", error);

    // Duplicate index error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Menu Item already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// GET ALL MENU ITEMS
// =====================================================

const getAllMenuItems = async (req, res) => {
  try {

    const items = await MenuItem.find({
      isActive: true,
    })
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


// =====================================================
// GET MENU ITEM BY ID
// =====================================================

const getMenuItemById = async (req, res) => {
  try {

    const { id } = req.params;


    const item = await MenuItem.findOne({
      _id: id,
      isActive: true,
    })
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


// =====================================================
// UPDATE MENU ITEM
// =====================================================

const updateMenuItem = async (req, res) => {
  try {

    const { id } = req.params;


    // 1. Find item
    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu Item not found",
      });
    }


    // 2. Find restaurant
    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or inactive",
      });
    }


    // 3. Ownership check
    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this restaurant",
      });
    }


    // 4. Item name
    if (req.body.itemName !== undefined) {

      const newItemName = req.body.itemName.trim();

      if (!newItemName) {
        return res.status(400).json({
          success: false,
          message: "Item name cannot be empty",
        });
      }


      const existingItem = await MenuItem.findOne({
        restaurantId: item.restaurantId,
        categoryId: item.categoryId,
        itemName: newItemName,
        _id: { $ne: id },
        isActive: true,
      });


      if (existingItem) {
        return res.status(400).json({
          success: false,
          message: "Menu Item already exists",
        });
      }


      item.itemName = newItemName;
    }


    // 5. Description
    if (req.body.description !== undefined) {
      item.description = req.body.description;
    }


    // 6. Price
    if (req.body.price !== undefined) {

      if (Number(req.body.price) < 0) {
        return res.status(400).json({
          success: false,
          message: "Price cannot be negative",
        });
      }

      item.price = req.body.price;
    }


    // 7. Image
    if (req.body.image !== undefined) {
      item.image = req.body.image;
    }


    // 8. Veg / Non-Veg
    if (req.body.isVeg !== undefined) {
      item.isVeg = req.body.isVeg;
    }


    // 9. Preparation time
    if (req.body.preparationTime !== undefined) {

      if (Number(req.body.preparationTime) < 0) {
        return res.status(400).json({
          success: false,
          message: "Preparation time cannot be negative",
        });
      }

      item.preparationTime = req.body.preparationTime;
    }


    // 10. Availability
    if (req.body.isAvailable !== undefined) {
      item.isAvailable = req.body.isAvailable;
    }


    // 11. Recommended
    if (req.body.isRecommended !== undefined) {
      item.isRecommended = req.body.isRecommended;
    }


    // 12. Active status
    if (req.body.isActive !== undefined) {
      item.isActive = req.body.isActive;
    }


    // 13. Save
    await item.save();


    return res.status(200).json({
      success: true,
      message: "Menu Item updated successfully",
      data: item,
    });

  } catch (error) {

    console.error("Update Menu Item Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Menu Item already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// DELETE MENU ITEM
// =====================================================

const deleteMenuItem = async (req, res) => {
  try {

    const { id } = req.params;


    // 1. Find item
    const item = await MenuItem.findById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Menu Item not found",
      });
    }


    // 2. Find restaurant
    const restaurant = await Restaurant.findOne({
      _id: item.restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or inactive",
      });
    }


    // 3. Ownership check
    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this restaurant",
      });
    }


    // 4. Soft delete
    item.isActive = false;

    await item.save();


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


// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
};
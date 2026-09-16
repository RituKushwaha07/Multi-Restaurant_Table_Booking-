const MenuCategory = require("../models/MenuCategory");
const Restaurant = require("../models/Restaurant");


// =====================================================
// CREATE MENU CATEGORY
// =====================================================

const createMenuCategory = async (req, res) => {
  try {
    const {
      restaurantId,
      categoryName,
      description,
      image,
      displayOrder,
    } = req.body;

    // 1. Basic validation
    if (!restaurantId || !categoryName) {
      return res.status(400).json({
        success: false,
        message: "Restaurant and Category Name are required",
      });
    }

    // 2. Check restaurant exists and active
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

    // 4. Check duplicate category
    const existingCategory = await MenuCategory.findOne({
      restaurantId,
      categoryName: categoryName.trim(),
      isActive: true,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists for this restaurant",
      });
    }

    // 5. Create category
    const category = await MenuCategory.create({
      restaurantId,
      categoryName: categoryName.trim(),
      description,
      image,
      displayOrder,
    });

    // 6. Response
    return res.status(201).json({
      success: true,
      message: "Menu Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create Menu Category Error:", error);

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category already exists for this restaurant",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// GET ALL MENU CATEGORIES
// =====================================================

const getAllMenuCategories = async (req, res) => {
  try {
    const categories = await MenuCategory.find({
      isActive: true,
    })
      .populate("restaurantId", "name city")
      .sort({
        displayOrder: 1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    console.error("Get Categories Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// GET MENU CATEGORY BY ID
// =====================================================

const getMenuCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await MenuCategory.findOne({
      _id: id,
      isActive: true,
    }).populate("restaurantId", "name city");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Menu Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get Category By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// UPDATE MENU CATEGORY
// =====================================================

const updateMenuCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find category
    const category = await MenuCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Menu Category not found",
      });
    }

    // 2. Find restaurant
    const restaurant = await Restaurant.findOne({
      _id: category.restaurantId,
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

    // 4. Category name
    if (req.body.categoryName !== undefined) {
      const newCategoryName = req.body.categoryName.trim();

      if (!newCategoryName) {
        return res.status(400).json({
          success: false,
          message: "Category name cannot be empty",
        });
      }

      // Check duplicate category
      const existingCategory = await MenuCategory.findOne({
        restaurantId: category.restaurantId,
        categoryName: newCategoryName,
        _id: { $ne: id },
        isActive: true,
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category already exists for this restaurant",
        });
      }

      category.categoryName = newCategoryName;
    }

    // 5. Description
    if (req.body.description !== undefined) {
      category.description = req.body.description;
    }

    // 6. Image
    if (req.body.image !== undefined) {
      category.image = req.body.image;
    }

    // 7. Display order
    if (req.body.displayOrder !== undefined) {
      if (req.body.displayOrder < 1) {
        return res.status(400).json({
          success: false,
          message: "Display order must be at least 1",
        });
      }

      category.displayOrder = req.body.displayOrder;
    }

    // 8. Active status
    if (req.body.isActive !== undefined) {
      category.isActive = req.body.isActive;
    }

    // 9. Save
    await category.save();

    return res.status(200).json({
      success: true,
      message: "Menu Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update Category Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category already exists for this restaurant",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// =====================================================
// DELETE MENU CATEGORY
// =====================================================

const deleteMenuCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find category
    const category = await MenuCategory.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Menu Category not found",
      });
    }

    // 2. Find restaurant
    const restaurant = await Restaurant.findOne({
      _id: category.restaurantId,
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
    category.isActive = false;

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Menu Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete Category Error:", error);

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
  createMenuCategory,
  getAllMenuCategories,
  getMenuCategoryById,
  updateMenuCategory,
  deleteMenuCategory,
};
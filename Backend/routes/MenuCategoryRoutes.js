const express = require("express");

const router = express.Router();

const {
  createMenuCategory,
  getAllMenuCategories,
  getMenuCategoryById,
  updateMenuCategory,
  deleteMenuCategory,
} = require("../controllers/menuCategoryController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// Create Category
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  createMenuCategory
);

// Get All Categories
router.get(
  "/",
  protect,
  getAllMenuCategories
);

// Get Category By ID
router.get(
  "/:id",
  protect,
  getMenuCategoryById
);

// Update Category
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  updateMenuCategory
);

// Delete Category
router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  deleteMenuCategory
);

module.exports = router;
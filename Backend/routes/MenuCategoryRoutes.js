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


// =====================================================
// CREATE CATEGORY
// =====================================================

router.post(
  "/",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  createMenuCategory
);


// =====================================================
// GET ALL CATEGORIES
// =====================================================

router.get(
  "/",
  protect,
  getAllMenuCategories
);


// =====================================================
// GET CATEGORY BY ID
// =====================================================

router.get(
  "/:id",
  protect,
  getMenuCategoryById
);


// =====================================================
// UPDATE CATEGORY
// =====================================================

router.put(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  updateMenuCategory
);


// =====================================================
// DELETE CATEGORY
// =====================================================

router.delete(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  deleteMenuCategory
);


module.exports = router;
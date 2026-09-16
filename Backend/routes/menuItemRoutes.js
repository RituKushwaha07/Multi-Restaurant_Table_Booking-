const express = require("express");

const router = express.Router();

const {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuItemController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");


// =====================================================
// CREATE MENU ITEM
// =====================================================

router.post(
  "/",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  createMenuItem
);


// =====================================================
// GET ALL MENU ITEMS
// =====================================================

router.get(
  "/",
  protect,
  getAllMenuItems
);


// =====================================================
// GET MENU ITEM BY ID
// =====================================================

router.get(
  "/:id",
  protect,
  getMenuItemById
);


// =====================================================
// UPDATE MENU ITEM
// =====================================================

router.put(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  updateMenuItem
);


// =====================================================
// DELETE MENU ITEM
// =====================================================

router.delete(
  "/:id",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  deleteMenuItem
);


module.exports = router;
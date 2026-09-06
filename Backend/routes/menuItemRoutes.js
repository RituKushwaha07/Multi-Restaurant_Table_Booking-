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

// Create Menu Item
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  createMenuItem
);

// Get All Menu Items
router.get(
  "/",
  protect,
  getAllMenuItems
);

// Get Menu Item By ID
router.get(
  "/:id",
  protect,
  getMenuItemById
);

// Update Menu Item
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  updateMenuItem
);

// Delete Menu Item
router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  deleteMenuItem
);

module.exports = router;
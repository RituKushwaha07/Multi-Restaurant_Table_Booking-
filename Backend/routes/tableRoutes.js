const express = require("express");

const router = express.Router();

const {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// Create Table
router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  createTable
);

// Get All Tables
router.get(
  "/",
  protect,
  getAllTables
);

// Get Table By ID
router.get(
  "/:id",
  protect,
  getTableById
);

// Update Table
router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  updateTable
);

// Delete Table
router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER", "MANAGER"),
  deleteTable
);

module.exports = router;
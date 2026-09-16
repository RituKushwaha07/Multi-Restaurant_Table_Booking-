const express = require("express");

const router = express.Router();

// Middlewares
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// Controllers
const {
  createManager,
  getAllManagers,
  getManagerById,
  updateManager,
  updateManagerStatus,
  deleteManager,
} = require("../controllers/staffController");

// ======================================================
// Create Manager
// POST /api/staff
// ======================================================

router.post(
  "/",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  createManager
);

// ======================================================
// Get All Managers
// GET /api/staff
// ======================================================

router.get(
  "/",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  getAllManagers
);

// ======================================================
// Get Manager By ID
// GET /api/staff/:id
// ======================================================

router.get(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  getManagerById
);

// ======================================================
// Update Manager
// PUT /api/staff/:id
// ======================================================

router.put(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  updateManager
);

// ======================================================
// Change Manager Status
// PATCH /api/staff/:id/status
// ======================================================

router.patch(
  "/:id/status",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  updateManagerStatus
);

// ======================================================
// Delete Manager
// DELETE /api/staff/:id
// ======================================================

router.delete(
  "/:id",
  protect,
  authorize("SUPER_ADMIN", "RESTAURANT_OWNER"),
  deleteManager
);

// ======================================================
// Export Router
// ======================================================

module.exports = router;
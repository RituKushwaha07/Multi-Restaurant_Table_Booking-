const Table = require("../models/Table");
const Restaurant = require("../models/Restaurant");

// ==========================================
// Create Table
// ==========================================

const createTable = async (req, res) => {
  try {
    const {
      restaurantId,
      tableNumber,
      capacity,
      floor,
      status,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (
      !restaurantId ||
      !tableNumber ||
      capacity === undefined ||
      !floor
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant, Table Number, Capacity and Floor are required",
      });
    }

    // ==========================================
    // Capacity Validation
    // ==========================================

    if (capacity < 1) {
      return res.status(400).json({
        success: false,
        message: "Capacity must be at least 1",
      });
    }

    // ==========================================
    // Check Restaurant
    // ==========================================

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

    // ==========================================
    // Ownership Check
    // ==========================================

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this restaurant",
      });
    }

    // ==========================================
    // Check Duplicate Table
    // ==========================================

    const existingTable = await Table.findOne({
      restaurantId,
      tableNumber,
    });

    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: "Table already exists for this restaurant",
      });
    }

    // ==========================================
    // Create Table
    // ==========================================

    const table = await Table.create({
      restaurantId,
      tableNumber,
      capacity,
      floor,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: table,
    });
  } catch (error) {
    console.error("Create Table Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Get All Tables
// ==========================================

const getAllTables = async (req, res) => {
  try {
    const tables = await Table.find({
      isActive: true,
    })
      .populate("restaurantId", "name city")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error("Get Tables Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Get Table By ID
// ==========================================

const getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findOne({
      _id: id,
      isActive: true,
    }).populate(
      "restaurantId",
      "name city"
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error("Get Table By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Update Table
// ==========================================

const updateTable = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // Find Table
    // ==========================================

    const table = await Table.findById(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // ==========================================
    // Find Restaurant
    // ==========================================

    const restaurant = await Restaurant.findById(
      table.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==========================================
    // Ownership Check
    // ==========================================

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this restaurant",
      });
    }

    // ==========================================
    // Update Table Number
    // ==========================================

    if (req.body.tableNumber !== undefined) {
      const existingTable = await Table.findOne({
        restaurantId: table.restaurantId,
        tableNumber: req.body.tableNumber,
        _id: { $ne: id },
      });

      if (existingTable) {
        return res.status(400).json({
          success: false,
          message: "Table number already exists for this restaurant",
        });
      }

      table.tableNumber = req.body.tableNumber;
    }

    // ==========================================
    // Update Capacity
    // ==========================================

    if (req.body.capacity !== undefined) {
      if (req.body.capacity < 1) {
        return res.status(400).json({
          success: false,
          message: "Capacity must be at least 1",
        });
      }

      table.capacity = req.body.capacity;
    }

    // ==========================================
    // Update Floor
    // ==========================================

    if (req.body.floor !== undefined) {
      table.floor = req.body.floor;
    }

    // ==========================================
    // Update Status
    // ==========================================

    if (req.body.status !== undefined) {
      table.status = req.body.status;
    }

    // ==========================================
    // Update Active Status
    // ==========================================

    if (req.body.isActive !== undefined) {
      table.isActive = req.body.isActive;
    }

    // ==========================================
    // Save
    // ==========================================

    await table.save();

    return res.status(200).json({
      success: true,
      message: "Table updated successfully",
      data: table,
    });
  } catch (error) {
    console.error("Update Table Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Delete Table - Soft Delete
// ==========================================

const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    // ==========================================
    // Find Table
    // ==========================================

    const table = await Table.findById(id);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // ==========================================
    // Find Restaurant
    // ==========================================

    const restaurant = await Restaurant.findById(
      table.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==========================================
    // Ownership Check
    // ==========================================

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this restaurant",
      });
    }

    // ==========================================
    // Soft Delete
    // ==========================================

    table.isActive = false;

    await table.save();

    return res.status(200).json({
      success: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.error("Delete Table Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Export Controllers
// ==========================================

module.exports = {
  createTable,
  getAllTables,
  getTableById,
  updateTable,
  deleteTable,
};
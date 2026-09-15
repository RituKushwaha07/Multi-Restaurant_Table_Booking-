const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    // ==========================================
    // Restaurant
    // ==========================================
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
    },

    // ==========================================
    // Table Number
    // ==========================================
    tableNumber: {
      type: String,
      required: [true, "Table number is required"],
      trim: true,
    },

    // ==========================================
    // Capacity
    // ==========================================
    capacity: {
      type: Number,
      required: [true, "Table capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },

    // ==========================================
    // Floor
    // ==========================================
    floor: {
      type: String,
      required: [true, "Floor is required"],
      trim: true,
    },

    // ==========================================
    // Table Status
    // ==========================================
    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "BOOKED",
        "RESERVED",
        "MAINTENANCE",
      ],
      default: "AVAILABLE",
    },

    // ==========================================
    // Active / Inactive
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// Unique Table Number per Restaurant
// ==========================================
tableSchema.index(
  { restaurantId: 1, tableNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Table", tableSchema);
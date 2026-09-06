const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
    },

    tableNumber: {
      type: String,
      required: [true, "Table number is required"],
      trim: true,
    },

    capacity: {
      type: Number,
      required: [true, "Table capacity is required"],
      min: [1, "Capacity must be at least 1"],
    },

    floor: {
      type: String,
      required: [true, "Floor is required"],
      trim: true,
    },

    status: {
      type: String,
      enum: ["AVAILABLE", "BOOKED", "RESERVED", "MAINTENANCE"],
      default: "AVAILABLE",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Table", tableSchema);
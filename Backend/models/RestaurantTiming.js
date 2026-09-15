const mongoose = require("mongoose");

const restaurantTimingSchema = new mongoose.Schema(
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
    // Day
    // ==========================================

    day: {
      type: String,
      required: [true, "Day is required"],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },

    // ==========================================
    // Opening Time
    // ==========================================

    openTime: {
      type: String,
      default: "",
    },

    // ==========================================
    // Closing Time
    // ==========================================

    closeTime: {
      type: String,
      default: "",
    },

    // ==========================================
    // Closed Status
    // ==========================================

    isClosed: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // Active Status
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
// One timing per day for one restaurant
// ==========================================

restaurantTimingSchema.index(
  {
    restaurantId: 1,
    day: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "RestaurantTiming",
  restaurantTimingSchema
);
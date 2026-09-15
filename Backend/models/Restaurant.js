const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    // =======================================
    // Restaurant Name
    // =======================================

    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      unique: true,
    },

    // =======================================
    // Description
    // =======================================

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    // =======================================
    // Address
    // =======================================

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    // =======================================
    // City
    // =======================================

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },

    // =======================================
    // State
    // =======================================

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    // =======================================
    // Country
    // =======================================

    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },

    // =======================================
    // Cuisine
    // =======================================

    cuisine: {
      type: String,
      required: [true, "Cuisine is required"],
      trim: true,
    },

    // =======================================
    // Restaurant Images
    // =======================================

    images: [
      {
        type: String,
      },
    ],

    // =======================================
    // Restaurant Owner
    // =======================================

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // =======================================
    // Active Status
    // =======================================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
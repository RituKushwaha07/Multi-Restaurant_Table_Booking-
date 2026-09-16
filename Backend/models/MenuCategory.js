const mongoose = require("mongoose");

const menuCategorySchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
    },

    categoryName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    displayOrder: {
      type: Number,
      default: 1,
      min: [1, "Display order must be at least 1"],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Same category name cannot exist twice
// inside the same restaurant
menuCategorySchema.index(
  {
    restaurantId: 1,
    categoryName: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("MenuCategory", menuCategorySchema);
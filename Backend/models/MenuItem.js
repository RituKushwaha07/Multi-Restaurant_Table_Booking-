const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: [true, "Menu category is required"],
      index: true,
    },

    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    isVeg: {
      type: Boolean,
      default: true,
    },

    preparationTime: {
      type: Number,
      default: 15,
      min: [0, "Preparation time cannot be negative"],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isRecommended: {
      type: Boolean,
      default: false,
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


// Same item name cannot exist twice
// in the same restaurant and category
menuItemSchema.index(
  {
    restaurantId: 1,
    categoryId: 1,
    itemName: 1,
  },
  {
    unique: true,
  }
);


module.exports = mongoose.model("MenuItem", menuItemSchema);
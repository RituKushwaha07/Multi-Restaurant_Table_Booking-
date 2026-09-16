const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
      index: true,
    },

    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
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

// One customer can favorite a restaurant only once
favoriteSchema.index(
  {
    customerId: 1,
    restaurantId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Favorite", favoriteSchema);
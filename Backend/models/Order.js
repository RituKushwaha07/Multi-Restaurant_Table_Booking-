const mongoose = require("mongoose");

// ==========================================
// Order Item Schema
// ==========================================

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: [true, "Menu item is required"],
    },

    itemName: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    total: {
      type: Number,
      required: [true, "Item total is required"],
      min: [0, "Item total cannot be negative"],
    },
  },
  {
    _id: false,
  }
);

// ==========================================
// Order Schema
// ==========================================

const orderSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
    },

    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: function (items) {
          return items.length > 0;
        },

        message: "Order must contain at least one item",
      },
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },

    orderStatus: {
      type: String,

      enum: [
        "PLACED",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "SERVED",
        "CANCELLED",
      ],

      default: "PLACED",
      index: true,
    },

    paymentStatus: {
      type: String,

      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],

      default: "PENDING",
      index: true,
    },

    specialInstruction: {
      type: String,
      default: "",
      trim: true,
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

module.exports = mongoose.model("Order", orderSchema);
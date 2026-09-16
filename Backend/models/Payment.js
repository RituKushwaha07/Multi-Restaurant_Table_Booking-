const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    // Booking reference
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },

    // Customer reference
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Restaurant reference
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    // Payment amount
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment method
    paymentMethod: {
      type: String,
      enum: ["UPI", "CARD", "NET_BANKING", "CASH"],
      required: true,
    },

    // Payment status
    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    // Transaction ID
    transactionId: {
      type: String,
      default: "",
    },

    // Active / inactive
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
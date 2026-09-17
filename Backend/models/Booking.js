const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
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
    // Table
    // ==========================================
    tableId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: [true, "Table is required"],
      index: true,
    },

    // ==========================================
    // Customer
    // ==========================================
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
      index: true,
    },

    // ==========================================
    // Booking Code
    // ==========================================
    bookingCode: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },

    // ==========================================
    // Booking Date
    // ==========================================
    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
      index: true,
    },

    // ==========================================
    // Booking Time
    // ==========================================
    bookingTime: {
      type: String,
      required: [true, "Booking time is required"],
      trim: true,
    },

    // ==========================================
    // Number Of Guests
    // ==========================================
    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "Guests must be at least 1"],
    },

    // ==========================================
    // Booking Status
    // ==========================================
    bookingStatus: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "CHECKED_IN",
        "COMPLETED",
        "CANCELLED",
        "NO_SHOW",
      ],
      default: "PENDING",
      index: true,
    },


    cancellationReason:{
      type: String,
      default: "",
      trim: true,
    },

    
    cancelledAt:{
      type: Date,
      default: null,
    },

    // ==========================================
    // Payment Status
    // ==========================================
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

    // ==========================================
    // Special Request
    // ==========================================
    specialRequest: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // Active Status
    // ==========================================
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

// ==========================================
// Booking Index
// Used for checking duplicate bookings
// ==========================================
bookingSchema.index({
  restaurantId: 1,
  tableId: 1,
  bookingDate: 1,
  bookingTime: 1,
});

// ==========================================
// Export Model
// ==========================================
module.exports = mongoose.model(
  "Booking",
  bookingSchema
);
const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"],
      index: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
      index: true,
    },

    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
      index: true,
    },

    bookingTime: {
      type: String,
      required: [true, "Booking time is required"],
      trim: true,
    },

    guests: {
      type: Number,
      required: [true, "Number of guests is required"],
      min: [1, "Guests must be at least 1"],
    },

    status: {
      type: String,
      enum: [
        "WAITING",
        "NOTIFIED",
        "SEATED",
        "CANCELLED",
        "EXPIRED",
      ],
      default: "WAITING",
      index: true,
    },

    specialRequest: {
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

module.exports = mongoose.model("Waitlist", waitlistSchema);
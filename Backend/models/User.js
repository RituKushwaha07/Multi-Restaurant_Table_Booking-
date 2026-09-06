const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // ==========================================
    // Full Name
    // ==========================================
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },

    // ==========================================
    // Email
    // ==========================================
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // ==========================================
    // Phone
    // ==========================================
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^[0-9]{10}$/,
        "Please enter a valid 10 digit phone number",
      ],
    },

    // ==========================================
    // Password
    // ==========================================
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },

    // ==========================================
    // Role
    // ==========================================
    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "RESTAURANT_OWNER",
        "MANAGER",
        "CUSTOMER",
      ],
      default: "CUSTOMER",
    },

    // ==========================================
    // Restaurant
    // ==========================================
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      default: null,
    },

    // ==========================================
    // Profile Image
    // ==========================================
    profileImage: {
      type: String,
      default: "",
    },

    // ==========================================
    // Account Verification
    // ==========================================
    isVerified: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // Account Status
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // Last Login
    // ==========================================
    lastLogin: {
      type: Date,
      default: null,
    },
  },

  // ==========================================
  // Timestamps
  // ==========================================
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
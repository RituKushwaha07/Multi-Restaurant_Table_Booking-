const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

// ==========================================
// REGISTER
// ==========================================

const register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ==========================================
    // Validate Registration Role
    // ==========================================

    // Public registration can create only:
    // CUSTOMER
    // RESTAURANT_OWNER

    const selectedRole = role || "CUSTOMER";

    if (
      selectedRole !== "CUSTOMER" &&
      selectedRole !== "RESTAURANT_OWNER"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only CUSTOMER or RESTAURANT_OWNER registration is allowed",
      });
    }

    // ==========================================
    // Normalize Data
    // ==========================================

    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    // ==========================================
    // Check Email
    // ==========================================

    const emailExists = await User.findOne({
      email: normalizedEmail,
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // ==========================================
    // Check Phone
    // ==========================================

    const phoneExists = await User.findOne({
      phone: normalizedPhone,
    });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists",
      });
    }

    // ==========================================
    // Hash Password
    // ==========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // Create User
    // ==========================================

    const user = await User.create({
      fullName: normalizedFullName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: selectedRole,
    });

    // ==========================================
    // Response
    // ==========================================

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// LOGIN
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // ==========================================
    // Normalize Email
    // ==========================================

    const normalizedEmail = email.trim().toLowerCase();

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // Check Active User
    // ==========================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive",
      });
    }

    // ==========================================
    // Compare Password
    // ==========================================

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // ==========================================
    // Update Last Login
    // ==========================================

    user.lastLogin = new Date();

    await user.save();

    // ==========================================
    // Generate JWT
    // ==========================================

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// GET PROFILE
// ==========================================

const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// FORGOT PASSWORD
// ==========================================

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // ==========================================
    // Normalize Email
    // ==========================================

    const normalizedEmail = email.trim().toLowerCase();

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ==========================================
    // Generate Reset Token
    // ==========================================

    const resetToken = crypto.randomBytes(32).toString("hex");

    // ==========================================
    // Save Reset Token
    // ==========================================

    user.resetPasswordToken = resetToken;

    // Token expires after 15 minutes
    user.resetPasswordExpire = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Password reset token generated successfully",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};




// ==========================================
// RESET PASSWORD
// ==========================================

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: new Date() },
    });

    // ==========================================
    // Check Token
    // ==========================================

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // ==========================================
    // Hash New Password
    // ==========================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================================
    // Update Password
    // ==========================================

    user.password = hashedPassword;

    // ==========================================
    // Remove Reset Token
    // ==========================================

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Export Controllers
// ==========================================

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword
};
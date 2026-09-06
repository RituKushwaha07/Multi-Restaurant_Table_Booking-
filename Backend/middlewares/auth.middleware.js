const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    let token;

    // ==========================================
    // Check Authorization Header
    // ==========================================
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ==========================================
    // Token Not Found
    // ==========================================
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // ==========================================
    // Verify Token
    // ==========================================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // Find User
    // Password excluded
    // ==========================================
    const user = await User.findById(decoded.id)
      .select("-password");

    // ==========================================
    // User Not Found
    // ==========================================
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================================
    // Check Account Active
    // ==========================================
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // ==========================================
    // Store Logged-in User
    // ==========================================
    req.user = user;

    next();

  } catch (error) {

    console.error("Auth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = protect;
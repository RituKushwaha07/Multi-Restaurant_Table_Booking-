const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
// PROTECT MIDDLEWARE
// ==========================================

const protect = async (req, res, next) => {
  try {
    let token;

    // ==========================================
    // 1. Check Authorization Header
    // ==========================================

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ==========================================
    // 2. Token Not Found
    // ==========================================

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // ==========================================
    // 3. Verify JWT Token
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // ==========================================
    // 4. Find User From Database
    // ==========================================

    const user = await User.findById(decoded.id)
      .select("-password");

    // ==========================================
    // 5. User Not Found
    // ==========================================

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================================
    // 6. Check Account Status
    // ==========================================

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // ==========================================
    // 7. Store User in Request
    // ==========================================

    req.user = user;

    // ==========================================
    // 8. Continue to Next Middleware / Controller
    // ==========================================

    next();

  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

module.exports = protect;
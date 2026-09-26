const express = require("express");

const router = express.Router();

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/authorize.middleware");

const {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword
} = require("../controllers/auth.controller");


router.post("/register", register);

router.post("/login", login);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/profile", protect, getProfile);


// ==========================================
// AUTHORIZATION TEST ROUTE
// ==========================================

router.get(
  "/owner-test",
  protect,
  authorize("RESTAURANT_OWNER"),
  (req, res) => {

    return res.status(200).json({
      success: true,
      message: "Restaurant Owner access granted",
      user: req.user
    });

  }
);


module.exports = router;
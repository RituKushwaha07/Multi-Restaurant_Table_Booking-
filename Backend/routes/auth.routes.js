const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

const {register,login,getProfile,} = require("../controllers/auth.controller");


router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);

module.exports = router;
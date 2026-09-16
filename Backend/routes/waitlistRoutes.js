const express = require("express");

const router = express.Router();

const {
  joinWaitlist,
  getMyWaitlist,
  getAllWaitlist,
  updateWaitlistStatus,
  leaveWaitlist,
} = require("../controllers/waitlistController");

const protect = require("../middlewares/auth.middleware");
const authorize = require("../middlewares/role.middleware");

// JOIN WAITLIST
router.post(
  "/",
  protect,
  authorize("CUSTOMER"),
  joinWaitlist
);

// GET MY WAITLIST
router.get(
  "/my",
  protect,
  authorize("CUSTOMER"),
  getMyWaitlist
);

// GET ALL WAITLIST
router.get(
  "/",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER",
    "MANAGER"
  ),
  getAllWaitlist
);

// UPDATE WAITLIST STATUS
router.patch(
  "/:id/status",
  protect,
  authorize(
    "SUPER_ADMIN",
    "RESTAURANT_OWNER"
  ),
  updateWaitlistStatus
);

// LEAVE WAITLIST
router.delete(
  "/:id",
  protect,
  authorize("CUSTOMER"),
  leaveWaitlist
);

module.exports = router;
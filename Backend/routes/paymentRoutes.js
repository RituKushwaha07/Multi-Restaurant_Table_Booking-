
const express = require("express");

const router = express.Router();

const {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
} = require("../controllers/paymentController");

// CREATE PAYMENT
router.post("/", createPayment);

// GET ALL PAYMENTS
router.get("/", getAllPayments);

// GET PAYMENT BY ID
router.get("/:id", getPaymentById);

// UPDATE PAYMENT
router.put("/:id", updatePayment);

// UPDATE PAYMENT STATUS
router.patch("/:id/status", updatePaymentStatus);

// DELETE PAYMENT
router.delete("/:id", deletePayment);

module.exports = router;

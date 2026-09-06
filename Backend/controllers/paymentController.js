const Payment = require("../models/Payment");

// =====================================
// CREATE PAYMENT
// POST /api/payments
// =====================================
const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      customerId,
      restaurantId,
      amount,
      paymentMethod,
      paymentStatus,
      transactionId,
    } = req.body;

    // Basic validation
    if (
      !bookingId ||
      !customerId ||
      !restaurantId ||
      amount === undefined ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "bookingId, customerId, restaurantId, amount and paymentMethod are required",
      });
    }

    const payment = await Payment.create({
      bookingId,
      customerId,
      restaurantId,
      amount,
      paymentMethod,
      paymentStatus,
      transactionId,
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

// =====================================
// GET ALL PAYMENTS
// GET /api/payments
// =====================================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("bookingId")
      .populate("customerId", "-password")
      .populate("restaurantId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      count: payments.length,
      data: payments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

// =====================================
// GET PAYMENT BY ID
// GET /api/payments/:id
// =====================================
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findById(id)
      .populate("bookingId")
      .populate("customerId", "-password")
      .populate("restaurantId");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment fetched successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: error.message,
    });
  }
};

// =====================================
// UPDATE PAYMENT
// PUT /api/payments/:id
// =====================================
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: error.message,
    });
  }
};

// =====================================
// UPDATE PAYMENT STATUS
// PATCH /api/payments/:id/status
// =====================================
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId } = req.body;

    const allowedStatus = [
      "PENDING",
      "SUCCESS",
      "FAILED",
      "REFUNDED",
    ];

    if (!allowedStatus.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status. Use PENDING, SUCCESS, FAILED or REFUNDED",
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      id,
      {
        paymentStatus,
        ...(transactionId && { transactionId }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

// =====================================
// DELETE PAYMENT
// DELETE /api/payments/:id
// =====================================
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await Payment.findByIdAndDelete(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: error.message,
    });
  }
};

// =====================================
// EXPORT
// =====================================
module.exports = {createPayment,getAllPayments,getPaymentById,updatePayment,updatePaymentStatus,deletePayment,};

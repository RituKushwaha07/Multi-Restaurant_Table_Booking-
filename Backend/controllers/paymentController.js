const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");

// =====================================
// CREATE PAYMENT
// POST /api/payments
// =====================================

const createPayment = async (req, res) => {
  try {
    const {
      bookingId,
      restaurantId,
      amount,
      paymentMethod,
    } = req.body;

    // 1. Basic validation
    if (
      !bookingId ||
      !restaurantId ||
      amount === undefined ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message:
          "bookingId, restaurantId, amount and paymentMethod are required",
      });
    }

    // 2. Check logged-in customer
    const customer = await User.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 3. Find booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 4. Check booking belongs to logged-in customer
    if (booking.customerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this booking",
      });
    }

    // 5. Check restaurant
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // 6. Check booking restaurant
    if (booking.restaurantId.toString() !== restaurantId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Booking does not belong to this restaurant",
      });
    }

    // 7. Check duplicate payment
    const existingPayment = await Payment.findOne({
      bookingId,
      isActive: true,
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: "Payment already exists for this booking",
        data: existingPayment,
      });
    }

    // 8. Create payment
    const payment = await Payment.create({
      bookingId,
      customerId: req.user._id,
      restaurantId,
      amount,
      paymentMethod,
      paymentStatus: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      data: payment,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

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
    console.error("Get All Payments Error:", error);

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
    console.error("Get Payment By ID Error:", error);

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
    console.error("Update Payment Error:", error);

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

    // 1. Allowed payment statuses
    const allowedStatus = [
      "PENDING",
      "SUCCESS",
      "FAILED",
      "REFUNDED",
    ];

    // 2. Validate payment status
    if (!allowedStatus.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment status. Use PENDING, SUCCESS, FAILED or REFUNDED",
      });
    }

    // 3. Find payment
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // 4. Update payment status
    payment.paymentStatus = paymentStatus;

    if (transactionId) {
      payment.transactionId = transactionId;
    }

    await payment.save();

    // 5. Find related booking
    const booking = await Booking.findById(payment.bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 6. Sync booking payment status
    if (paymentStatus === "SUCCESS") {
      booking.paymentStatus = "PAID";
    } else if (paymentStatus === "PENDING") {
      booking.paymentStatus = "PENDING";
    } else if (paymentStatus === "FAILED") {
      booking.paymentStatus = "PENDING";
    } else if (paymentStatus === "REFUNDED") {
      booking.paymentStatus = "REFUNDED";
    }

    // 7. Save booking
    await booking.save();

    // 8. Response
    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      data: {
        payment,
        booking,
      },
    });
  } catch (error) {
    console.error("Update Payment Status Error:", error);

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
    console.error("Delete Payment Error:", error);

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

module.exports = {
  createPayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
  updatePaymentStatus,
  deletePayment,
};
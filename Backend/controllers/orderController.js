const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const Booking = require("../models/Booking");
const User = require("../models/User");

// ==========================================
// CREATE ORDER
// Customer
// ==========================================

const createOrder = async (req, res) => {
  try {
    const {
      restaurantId,
      bookingId,
      items,
      specialInstruction,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!restaurantId || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant and at least one item are required",
      });
    }

    // ==========================================
    // Logged-in Customer
    // ==========================================

    const customerId = req.user._id;

    // ==========================================
    // Check Customer
    // ==========================================

    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==========================================
    // Check Restaurant
    // ==========================================

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      isActive: true,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or inactive",
      });
    }

    // ==========================================
    // Check Booking
    // ==========================================

    let booking = null;

    if (bookingId) {
      booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Booking belongs to customer

      if (
        booking.customerId.toString() !==
        customerId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "This booking does not belong to you",
        });
      }

      // Booking belongs to restaurant

      if (
        booking.restaurantId.toString() !==
        restaurantId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Booking does not belong to this restaurant",
        });
      }

      // Cancelled booking

      if (booking.bookingStatus === "CANCELLED") {
        return res.status(400).json({
          success: false,
          message:
            "Cannot create order for cancelled booking",
        });
      }
    }

    // ==========================================
    // Prepare Order Items
    // ==========================================

    const orderItems = [];

    let totalAmount = 0;

    for (const requestedItem of items) {
      const {
        menuItemId,
        quantity,
      } = requestedItem;

      // ==========================================
      // Validate Item
      // ==========================================

      if (!menuItemId || quantity === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "Menu item ID and quantity are required",
        });
      }

      if (quantity < 1) {
        return res.status(400).json({
          success: false,
          message:
            "Quantity must be at least 1",
        });
      }

      // ==========================================
      // Get Menu Item
      // ==========================================

      const menuItem = await MenuItem.findOne({
        _id: menuItemId,
        isActive: true,
      });

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message:
            `Menu item ${menuItemId} not found or inactive`,
        });
      }

      // ==========================================
      // Check Restaurant
      // ==========================================

      if (
        menuItem.restaurantId.toString() !==
        restaurantId.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${menuItem.itemName} does not belong to this restaurant`,
        });
      }

      // ==========================================
      // Check Availability
      // ==========================================

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message:
            `${menuItem.itemName} is currently unavailable`,
        });
      }

      // ==========================================
      // Calculate Item Total
      // ==========================================

      const itemTotal =
        menuItem.price * quantity;

      totalAmount += itemTotal;

      // ==========================================
      // Add Item
      // ==========================================

      orderItems.push({
        menuItemId: menuItem._id,
        itemName: menuItem.itemName,
        quantity: quantity,
        price: menuItem.price,
        total: itemTotal,
      });
    }

    // ==========================================
    // Create Order
    // ==========================================

    const order = await Order.create({
      restaurantId: restaurantId,

      bookingId: bookingId || null,

      customerId: customerId,

      items: orderItems,

      totalAmount: totalAmount,

      specialInstruction:
        specialInstruction || "",
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Create Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL ORDERS
// Admin / Owner / Manager
// ==========================================

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      isActive: true,
    })
      .populate(
        "restaurantId",
        "name city"
      )
      .populate(
        "customerId",
        "fullName email phone"
      )
      .populate(
        "bookingId",
        "bookingCode bookingDate bookingTime guests"
      )
      .populate(
        "items.menuItemId",
        "itemName price"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error(
      "Get All Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// GET ORDER BY ID
// ==========================================

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate(
        "restaurantId",
        "name city"
      )
      .populate(
        "customerId",
        "fullName email phone"
      )
      .populate(
        "bookingId",
        "bookingCode bookingDate bookingTime guests"
      )
      .populate(
        "items.menuItemId",
        "itemName price"
      );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error(
      "Get Order By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// UPDATE ORDER
// Admin / Owner / Manager
// ==========================================

const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // ==========================================
    // Update Order Status
    // ==========================================

    if (req.body.orderStatus !== undefined) {
      const allowedOrderStatus = [
        "PLACED",
        "CONFIRMED",
        "PREPARING",
        "READY",
        "SERVED",
        "CANCELLED",
      ];

      if (
        !allowedOrderStatus.includes(
          req.body.orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid order status",
        });
      }

      order.orderStatus =
        req.body.orderStatus;
    }

    // ==========================================
    // Update Payment Status
    // ==========================================

    if (req.body.paymentStatus !== undefined) {
      const allowedPaymentStatus = [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ];

      if (
        !allowedPaymentStatus.includes(
          req.body.paymentStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }

      order.paymentStatus =
        req.body.paymentStatus;
    }

    // ==========================================
    // Update Special Instruction
    // ==========================================

    if (
      req.body.specialInstruction !==
      undefined
    ) {
      order.specialInstruction =
        req.body.specialInstruction;
    }

    // ==========================================
    // Update Active Status
    // ==========================================

    if (
      req.body.isActive !==
      undefined
    ) {
      order.isActive =
        req.body.isActive;
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    console.error(
      "Update Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// DELETE ORDER - SOFT DELETE
// ==========================================

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.isActive = false;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Order Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
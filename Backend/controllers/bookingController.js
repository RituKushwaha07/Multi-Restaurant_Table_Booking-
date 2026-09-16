const Booking = require("../models/Booking");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const User = require("../models/User");

// ==========================================
// Create Booking
// Customer only
// ==========================================
const createBooking = async (req, res) => {
  try {
    const {
      restaurantId,
      tableId,
      bookingDate,
      bookingTime,
      guests,
      specialRequest,
    } = req.body;

    // ==========================================
    // Validation
    // ==========================================
    if (
      !restaurantId ||
      !tableId ||
      !bookingDate ||
      !bookingTime ||
      guests === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant, Table, Booking Date, Booking Time and Guests are required",
      });
    }

    if (guests < 1) {
      return res.status(400).json({
        success: false,
        message: "Guests must be at least 1",
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
    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==========================================
    // Check Restaurant Active
    // ==========================================
    if (!restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is currently inactive",
      });
    }

    // ==========================================
    // Check Table
    // ==========================================
    const table = await Table.findById(tableId);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // ==========================================
    // Check Table Belongs To Restaurant
    // ==========================================
    if (table.restaurantId.toString() !== restaurantId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Table does not belong to this restaurant",
      });
    }

    // ==========================================
    // Check Table Active
    // ==========================================
    if (!table.isActive) {
      return res.status(400).json({
        success: false,
        message: "Table is currently inactive",
      });
    }

    // ==========================================
    // Check Table Maintenance
    // ==========================================
    if (table.status === "MAINTENANCE") {
      return res.status(400).json({
        success: false,
        message: "Table is under maintenance",
      });
    }

    // ==========================================
    // Guest Capacity Validation
    // ==========================================
    if (guests > table.capacity) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${table.capacity} guests allowed for this table`,
      });
    }

    // ==========================================
    // Duplicate Booking Check
    // ==========================================
    const existingBooking = await Booking.findOne({
      tableId,
      bookingDate: new Date(bookingDate),
      bookingTime,
      bookingStatus: {
        $in: ["PENDING", "CONFIRMED", "CHECKED_IN"],
      },
      isActive: true,
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: "Table is already booked for this time",
      });
    }

    // ==========================================
    // Generate Booking Code
    // ==========================================
    const bookingCode =
      "BK" + Date.now().toString().slice(-8);

    // ==========================================
    // Create Booking
    // ==========================================
    const booking = await Booking.create({
      restaurantId,
      tableId,
      customerId,
      bookingCode,
      bookingDate: new Date(bookingDate),
      bookingTime,
      guests,
      specialRequest,
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Create Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ==========================================
// Get All Bookings
// Admin / Owner / Manager
// ==========================================
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("restaurantId", "name city")
      .populate("tableId", "tableNumber capacity floor")
      .populate("customerId", "fullName email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get All Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Get My Bookings
// Customer only
// ==========================================
const getMyBookings = async (req, res) => {
  try {
    const customerId = req.user._id;

    const bookings = await Booking.find({
      customerId: customerId,
    })
      .populate("restaurantId", "name city")
      .populate("tableId", "tableNumber capacity floor")
      .sort({ bookingDate: -1, bookingTime: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get My Bookings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Get Booking By ID
// ==========================================
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id)
      .populate("restaurantId", "name city")
      .populate("tableId", "tableNumber capacity floor")
      .populate("customerId", "fullName email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // Customer can see only own booking
    // ==========================================
    if (req.user.role === "CUSTOMER") {
      if (
        booking.customerId._id.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to view this booking",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error("Get Booking By ID Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// ==========================================
// Update Booking Status
// ==========================================

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    // ==========================================
    // Validate Status
    // ==========================================

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "COMPLETED",
      "CANCELLED",
      "NO_SHOW",
    ];

    if (!bookingStatus) {
      return res.status(400).json({
        success: false,
        message: "Booking status is required",
      });
    }

    if (!allowedStatuses.includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // ==========================================
    // Find Booking
    // ==========================================

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // Find Restaurant
    // ==========================================

    const restaurant = await Restaurant.findById(
      booking.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==========================================
    // Ownership Check
    // ==========================================

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this restaurant",
      });
    }

    // ==========================================
    // Update Status
    // ==========================================

    booking.bookingStatus = bookingStatus;

    await booking.save();

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });

  } catch (error) {
    console.error("Update Booking Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Update Booking
// ==========================================
const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // Customer can update only own booking
    // ==========================================
    if (req.user.role === "CUSTOMER") {
      if (
        booking.customerId.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to update this booking",
        });
      }
    }

    // ==========================================
    // Update Booking Date
    // ==========================================
    if (req.body.bookingDate) {
      booking.bookingDate = new Date(
        req.body.bookingDate
      );
    }

    // ==========================================
    // Update Booking Time
    // ==========================================
    if (req.body.bookingTime) {
      booking.bookingTime = req.body.bookingTime;
    }

    // ==========================================
    // Update Guests
    // ==========================================
    if (req.body.guests !== undefined) {
      const table = await Table.findById(
        booking.tableId
      );

      if (!table) {
        return res.status(404).json({
          success: false,
          message: "Table not found",
        });
      }

      if (req.body.guests < 1) {
        return res.status(400).json({
          success: false,
          message: "Guests must be at least 1",
        });
      }

      if (req.body.guests > table.capacity) {
        return res.status(400).json({
          success: false,
          message: `Maximum ${table.capacity} guests allowed`,
        });
      }

      booking.guests = req.body.guests;
    }

    // ==========================================
    // Update Special Request
    // ==========================================
    if (
      req.body.specialRequest !== undefined
    ) {
      booking.specialRequest =
        req.body.specialRequest;
    }

    // ==========================================
    // Update Booking Status
    // ==========================================
    if (req.body.bookingStatus) {
      booking.bookingStatus =
        req.body.bookingStatus;
    }

    // ==========================================
    // Update Payment Status
    // ==========================================
    if (req.body.paymentStatus) {
      booking.paymentStatus =
        req.body.paymentStatus;
    }

    // ==========================================
    // Update Active Status
    // ==========================================
    if (req.body.isActive !== undefined) {
      booking.isActive =
        req.body.isActive;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error("Update Booking Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ==========================================
// Delete Booking
// ==========================================
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==========================================
    // Customer can delete only own booking
    // ==========================================
    if (req.user.role === "CUSTOMER") {
      if (
        booking.customerId.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this booking",
        });
      }
    }

    await Booking.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete Booking Error:", error);

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
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  deleteBooking,
};
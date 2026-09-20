const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Restaurant = require("../models/Restaurant");
const Table = require("../models/Table");
const User = require("../models/User");

// ======================================================
// Constants
// ======================================================

const ACTIVE_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
];

const ALL_BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

// ======================================================
// Status Transition Rules
// ======================================================

const ALLOWED_STATUS_TRANSITIONS = {
  PENDING: [
    "CONFIRMED",
    "CANCELLED",
    "NO_SHOW",
  ],

  CONFIRMED: [
    "CHECKED_IN",
    "CANCELLED",
    "NO_SHOW",
  ],

  CHECKED_IN: [
    "COMPLETED",
  ],

  COMPLETED: [],

  CANCELLED: [],

  NO_SHOW: [],
};

// ======================================================
// Helper: Validate ObjectId
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ======================================================
// Helper: Parse Booking Date
// ======================================================

const parseBookingDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

// ======================================================
// Helper: Restaurant Staff Check
// SUPER_ADMIN
// RESTAURANT_OWNER
// MANAGER
// ======================================================

const isRestaurantStaff = (req, restaurant) => {
  if (req.user.role === "SUPER_ADMIN") {
    return true;
  }

  if (req.user.role === "RESTAURANT_OWNER") {
    return (
      restaurant.owner &&
      restaurant.owner.toString() === req.user._id.toString()
    );
  }

  if (req.user.role === "MANAGER") {
    return (
      req.user.restaurantId &&
      req.user.restaurantId.toString() ===
        restaurant._id.toString()
    );
  }

  return false;
};

// ======================================================
// Helper: Find Conflicting Booking
// ======================================================

const findConflictingBooking = async ({
  bookingId = null,
  tableId,
  bookingDate,
  bookingTime,
}) => {
  const query = {
    tableId,
    bookingDate,
    bookingTime,
    bookingStatus: {
      $in: ACTIVE_BOOKING_STATUSES,
    },
    isActive: true,
  };

  if (bookingId) {
    query._id = {
      $ne: bookingId,
    };
  }

  return Booking.findOne(query);
};

// ======================================================
// Create Booking
// Customer only
// ======================================================

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

    // ==================================================
    // Basic Validation
    // ==================================================

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

    // ==================================================
    // Validate IDs
    // ==================================================

    if (!isValidObjectId(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    if (!isValidObjectId(tableId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid table ID",
      });
    }

    // ==================================================
    // Validate Guests
    // ==================================================

    const numberOfGuests = Number(guests);

    if (
      !Number.isInteger(numberOfGuests) ||
      numberOfGuests < 1
    ) {
      return res.status(400).json({
        success: false,
        message: "Guests must be a positive integer",
      });
    }

    // ==================================================
    // Validate Time
    // ==================================================

    if (!TIME_REGEX.test(bookingTime)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid booking time. Use HH:mm format, example 20:00",
      });
    }

    // ==================================================
    // Validate Date
    // ==================================================

    const parsedBookingDate =
      parseBookingDate(bookingDate);

    if (!parsedBookingDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
    }

    // ==================================================
    // Logged-in Customer
    // ==================================================

    const customerId = req.user._id;

    // ==================================================
    // Check Customer
    // ==================================================

    const customer = await User.findById(customerId);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Customer not found",
      });
    }

    // ==================================================
    // Check Restaurant
    // ==================================================

    const restaurant = await Restaurant.findById(
      restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==================================================
    // Restaurant Active
    // ==================================================

    if (!restaurant.isActive) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is currently inactive",
      });
    }

    // ==================================================
    // Check Table
    // ==================================================

    const table = await Table.findById(tableId);

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found",
      });
    }

    // ==================================================
    // Table Belongs To Restaurant
    // ==================================================

    if (
      table.restaurantId.toString() !==
      restaurantId.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Table does not belong to this restaurant",
      });
    }

    // ==================================================
    // Table Active
    // ==================================================

    if (!table.isActive) {
      return res.status(400).json({
        success: false,
        message: "Table is currently inactive",
      });
    }

    // ==================================================
    // Maintenance Check
    // ==================================================

    if (table.status === "MAINTENANCE") {
      return res.status(400).json({
        success: false,
        message: "Table is under maintenance",
      });
    }

    // ==================================================
    // Capacity Check
    // ==================================================

    if (numberOfGuests > table.capacity) {
      return res.status(400).json({
        success: false,
        message:
          `Maximum ${table.capacity} guests allowed for this table`,
      });
    }

    // ==================================================
    // Duplicate Booking Check
    // ==================================================

    const existingBooking =
      await findConflictingBooking({
        tableId,
        bookingDate: parsedBookingDate,
        bookingTime,
      });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message:
          "Table is already booked for this time",
      });
    }

    // ==================================================
    // Generate Booking Code
    // ==================================================

    const bookingCode =
      "BK" + Date.now().toString().slice(-8);

    // ==================================================
    // Create Booking
    // ==================================================

    const booking = await Booking.create({
      restaurantId,
      tableId,
      customerId,
      bookingCode,
      bookingDate: parsedBookingDate,
      bookingTime,
      guests: numberOfGuests,
      specialRequest:
        specialRequest?.toString().trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Create Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// Get All Bookings
// SUPER_ADMIN
// RESTAURANT_OWNER
// MANAGER
// ======================================================

const getAllBookings = async (req, res) => {
  try {
    let query = {};

    // ==================================================
    // Restaurant Owner
    // ==================================================

    if (req.user.role === "RESTAURANT_OWNER") {
      const restaurants = await Restaurant.find({
        owner: req.user._id,
      }).select("_id");

      const restaurantIds =
        restaurants.map(
          (restaurant) => restaurant._id
        );

      query.restaurantId = {
        $in: restaurantIds,
      };
    }

    // ==================================================
    // Manager
    // ==================================================

    if (req.user.role === "MANAGER") {
      if (!req.user.restaurantId) {
        return res.status(403).json({
          success: false,
          message:
            "Manager is not assigned to a restaurant",
        });
      }

      query.restaurantId =
        req.user.restaurantId;
    }

    // ==================================================
    // SUPER_ADMIN
    // No filter
    // ==================================================

    const bookings = await Booking.find(query)
      .populate(
        "restaurantId",
        "name city"
      )
      .populate(
        "tableId",
        "tableNumber capacity floor"
      )
      .populate(
        "customerId",
        "fullName email phone"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(
      "Get All Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// Get My Bookings
// Customer only
// ======================================================

const getMyBookings = async (req, res) => {
  try {
    const customerId = req.user._id;

    const bookings = await Booking.find({
      customerId,
    })
      .populate(
        "restaurantId",
        "name city"
      )
      .populate(
        "tableId",
        "tableNumber capacity floor"
      )
      .sort({
        bookingDate: -1,
        bookingTime: -1,
      });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(
      "Get My Bookings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================================
// Get Booking By ID
// ======================================================

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    // ==================================================
    // Validate ID
    // ==================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // ==================================================
    // Find Booking
    // ==================================================

    const booking = await Booking.findById(id)
      .populate(
        "restaurantId",
        "name city owner"
      )
      .populate(
        "tableId",
        "tableNumber capacity floor"
      )
      .populate(
        "customerId",
        "fullName email phone"
      );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==================================================
    // Customer Ownership
    // ==================================================

    if (req.user.role === "CUSTOMER") {
      if (
        booking.customerId._id.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to view this booking",
        });
      }
    }

    // ==================================================
    // Staff Restaurant Access
    // ==================================================

    if (
      req.user.role === "RESTAURANT_OWNER" ||
      req.user.role === "MANAGER"
    ) {
      const restaurant =
        await Restaurant.findById(
          booking.restaurantId._id
        );

      if (
        !restaurant ||
        !isRestaurantStaff(req, restaurant)
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized for this restaurant",
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error(
      "Get Booking By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================================
// Update Booking Status
// SUPER_ADMIN
// RESTAURANT_OWNER
// MANAGER
// ======================================================

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bookingStatus } = req.body;

    // ==================================================
    // Validate ID
    // ==================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // ==================================================
    // Validate Status
    // ==================================================

    if (!bookingStatus) {
      return res.status(400).json({
        success: false,
        message:
          "Booking status is required",
      });
    }

    if (
      !ALL_BOOKING_STATUSES.includes(
        bookingStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    // ==================================================
    // Find Booking
    // ==================================================

    const booking = await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==================================================
    // Find Restaurant
    // ==================================================

    const restaurant =
      await Restaurant.findById(
        booking.restaurantId
      );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // ==================================================
    // Staff Access
    // ==================================================

    if (
      !isRestaurantStaff(
        req,
        restaurant
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized for this restaurant",
      });
    }

    // ==================================================
    // Check Status Transition
    // ==================================================

    if (
      booking.bookingStatus ===
      bookingStatus
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Booking is already ${bookingStatus}`,
      });
    }

    const allowedNextStatuses =
      ALLOWED_STATUS_TRANSITIONS[
        booking.bookingStatus
      ] || [];

    if (
      !allowedNextStatuses.includes(
        bookingStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Cannot change booking status from ${booking.bookingStatus} to ${bookingStatus}`,
      });
    }

    // ==================================================
    // Update
    // ==================================================

    booking.bookingStatus =
      bookingStatus;

    // ==================================================
    // Cancellation Information
    // ==================================================

    if (bookingStatus === "CANCELLED") {
      booking.cancelledAt =
        new Date();

      if (!booking.cancellationReason) {
        booking.cancellationReason =
          "Cancelled by restaurant";
      }
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Update Booking Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// Update Booking
//
// CUSTOMER:
// Own booking only
// Cannot update status/payment/isActive
//
// OWNER / MANAGER / ADMIN:
// Restaurant booking management
// ======================================================

const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // ==================================================
    // Validate ID
    // ==================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // ==================================================
    // Find Booking
    // ==================================================

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==================================================
    // Customer Access
    // ==================================================

    if (req.user.role === "CUSTOMER") {
      // ----------------------------------------------
      // Own Booking Check
      // ----------------------------------------------

      if (
        booking.customerId.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized to update this booking",
        });
      }

      // ----------------------------------------------
      // Customer can only modify
      // PENDING / CONFIRMED booking
      // ----------------------------------------------

      if (
        !["PENDING", "CONFIRMED"].includes(
          booking.bookingStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Booking cannot be updated because current status is ${booking.bookingStatus}`,
        });
      }

      // ----------------------------------------------
      // Protected Fields
      // ----------------------------------------------

      if (
        req.body.bookingStatus !==
          undefined ||
        req.body.paymentStatus !==
          undefined ||
        req.body.isActive !==
          undefined ||
        req.body.restaurantId !==
          undefined ||
        req.body.tableId !==
          undefined ||
        req.body.customerId !==
          undefined ||
        req.body.bookingCode !==
          undefined
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Customer cannot update protected booking fields",
        });
      }
    }

    // ==================================================
    // Staff Access
    // ==================================================

    if (
      req.user.role ===
        "RESTAURANT_OWNER" ||
      req.user.role === "MANAGER"
    ) {
      const restaurant =
        await Restaurant.findById(
          booking.restaurantId
        );

      if (
        !restaurant ||
        !isRestaurantStaff(
          req,
          restaurant
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized for this restaurant",
        });
      }
    }

    // ==================================================
    // New Date
    // ==================================================

    let newBookingDate =
      booking.bookingDate;

    if (
      req.body.bookingDate !==
      undefined
    ) {
      const parsedDate =
        parseBookingDate(
          req.body.bookingDate
        );

      if (!parsedDate) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking date",
        });
      }

      newBookingDate =
        parsedDate;
    }

    // ==================================================
    // New Time
    // ==================================================

    let newBookingTime =
      booking.bookingTime;

    if (
      req.body.bookingTime !==
      undefined
    ) {
      if (
        !TIME_REGEX.test(
          req.body.bookingTime
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid booking time. Use HH:mm format",
        });
      }

      newBookingTime =
        req.body.bookingTime;
    }

    // ==================================================
    // Date / Time Changed?
    // ==================================================

    const dateChanged =
      newBookingDate.getTime() !==
      new Date(
        booking.bookingDate
      ).getTime();

    const timeChanged =
      newBookingTime !==
      booking.bookingTime;

    // ==================================================
    // Double Booking Check
    // ==================================================

    if (
      dateChanged ||
      timeChanged
    ) {
      const existingBooking =
        await findConflictingBooking({
          bookingId: booking._id,
          tableId: booking.tableId,
          bookingDate: newBookingDate,
          bookingTime: newBookingTime,
        });

      if (existingBooking) {
        return res.status(400).json({
          success: false,
          message:
            "Table is already booked for this time",
        });
      }

      booking.bookingDate =
        newBookingDate;

      booking.bookingTime =
        newBookingTime;
    }

    // ==================================================
    // Guests
    // ==================================================

    if (
      req.body.guests !==
      undefined
    ) {
      const numberOfGuests =
        Number(req.body.guests);

      if (
        !Number.isInteger(
          numberOfGuests
        ) ||
        numberOfGuests < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Guests must be a positive integer",
        });
      }

      const table =
        await Table.findById(
          booking.tableId
        );

      if (!table) {
        return res.status(404).json({
          success: false,
          message:
            "Table not found",
        });
      }

      if (!table.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "Table is currently inactive",
        });
      }

      if (
        table.status ===
        "MAINTENANCE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Table is under maintenance",
        });
      }

      if (
        numberOfGuests >
        table.capacity
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Maximum ${table.capacity} guests allowed`,
        });
      }

      booking.guests =
        numberOfGuests;
    }

    // ==================================================
    // Special Request
    // ==================================================

    if (
      req.body.specialRequest !==
      undefined
    ) {
      booking.specialRequest =
        req.body.specialRequest
          ?.toString()
          .trim() || "";
    }

    // ==================================================
    // Staff Protected Fields
    // ==================================================

    if (
      req.user.role !==
      "CUSTOMER"
    ) {
      // ----------------------------------------------
      // Booking Status
      // ----------------------------------------------

      if (
        req.body.bookingStatus !==
        undefined
      ) {
        if (
          !ALL_BOOKING_STATUSES.includes(
            req.body.bookingStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid booking status",
          });
        }

        if (
          booking.bookingStatus !==
          req.body.bookingStatus
        ) {
          const allowedNextStatuses =
            ALLOWED_STATUS_TRANSITIONS[
              booking.bookingStatus
            ] || [];

          if (
            !allowedNextStatuses.includes(
              req.body.bookingStatus
            )
          ) {
            return res.status(400).json({
              success: false,
              message:
                `Cannot change booking status from ${booking.bookingStatus} to ${req.body.bookingStatus}`,
            });
          }

          booking.bookingStatus =
            req.body.bookingStatus;

          if (
            req.body.bookingStatus ===
            "CANCELLED"
          ) {
            booking.cancelledAt =
              new Date();

            if (
              !booking.cancellationReason
            ) {
              booking.cancellationReason =
                "Cancelled by restaurant";
            }
          }
        }
      }

      // ----------------------------------------------
      // Payment Status
      // ----------------------------------------------

      if (
        req.body.paymentStatus !==
        undefined
      ) {
        if (
          !PAYMENT_STATUSES.includes(
            req.body.paymentStatus
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid payment status",
          });
        }

        booking.paymentStatus =
          req.body.paymentStatus;
      }

      // ----------------------------------------------
      // Active Status
      // ----------------------------------------------

      if (
        req.body.isActive !==
        undefined
      ) {
        if (
          typeof req.body.isActive !==
          "boolean"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "isActive must be true or false",
          });
        }

        booking.isActive =
          req.body.isActive;
      }

      // ----------------------------------------------
      // Cancellation Reason
      // ----------------------------------------------

      if (
        req.body.cancellationReason !==
        undefined
      ) {
        booking.cancellationReason =
          req.body.cancellationReason
            ?.toString()
            .trim() || "";
      }
    }

    // ==================================================
    // Save
    // ==================================================

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking updated successfully",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Update Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// ======================================================
// Cancel Booking
// Customer only
// ======================================================

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancellationReason } =
      req.body;

    // ==================================================
    // Validate ID
    // ==================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // ==================================================
    // Validate Reason
    // ==================================================

    if (
      !cancellationReason ||
      !cancellationReason.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancellation reason is required",
      });
    }

    // ==================================================
    // Find Booking
    // ==================================================

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==================================================
    // Customer Ownership
    // ==================================================

    if (
      booking.customerId.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "You are not authorized to cancel this booking",
      });
    }

    // ==================================================
    // Cancellable Status
    // ==================================================

    if (
      !["PENDING", "CONFIRMED"].includes(
        booking.bookingStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          `Booking cannot be cancelled because current status is ${booking.bookingStatus}`,
      });
    }

    // ==================================================
    // Cancel
    // ==================================================

    booking.bookingStatus =
      "CANCELLED";

    booking.cancellationReason =
      cancellationReason.trim();

    booking.cancelledAt =
      new Date();

    // Keep history
    booking.isActive = true;

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking cancelled successfully",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Cancel Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================================
// Delete Booking
//
// SUPER_ADMIN
// RESTAURANT_OWNER
// MANAGER
//
// Soft Delete
// ======================================================

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // ==================================================
    // Validate ID
    // ==================================================

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID",
      });
    }

    // ==================================================
    // Find Booking
    // ==================================================

    const booking =
      await Booking.findById(id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // ==================================================
    // Customer Cannot Delete
    // ==================================================

    if (
      req.user.role ===
      "CUSTOMER"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Customer cannot delete bookings",
      });
    }

    // ==================================================
    // Restaurant Access
    // ==================================================

    if (
      req.user.role ===
        "RESTAURANT_OWNER" ||
      req.user.role ===
        "MANAGER"
    ) {
      const restaurant =
        await Restaurant.findById(
          booking.restaurantId
        );

      if (
        !restaurant ||
        !isRestaurantStaff(
          req,
          restaurant
        )
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not authorized for this restaurant",
        });
      }
    }

    // ==================================================
    // Soft Delete
    // ==================================================

    booking.isActive = false;

    await booking.save();

    return res.status(200).json({
      success: true,
      message:
        "Booking deleted successfully",
      data: booking,
    });
  } catch (error) {
    console.error(
      "Delete Booking Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// ======================================================
// Export Controllers
// ======================================================

module.exports = {
  createBooking,
  getAllBookings,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  updateBooking,
  cancelBooking,
  deleteBooking,
};
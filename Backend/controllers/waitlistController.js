const Waitlist = require("../models/Waitlist");
const Restaurant = require("../models/Restaurant");

// JOIN WAITLIST
const joinWaitlist = async (req, res) => {
  try {
    const {
      restaurantId,
      bookingDate,
      bookingTime,
      guests,
      specialRequest,
    } = req.body;

    if (!restaurantId || !bookingDate || !bookingTime || !guests) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant ID, booking date, booking time and guests are required",
      });
    }

    if (Number(guests) < 1) {
      return res.status(400).json({
        success: false,
        message: "Guests must be at least 1",
      });
    }

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

    // Check if customer is already waiting
    const existingWaitlist = await Waitlist.findOne({
      restaurantId,
      customerId: req.user._id,
      bookingDate: new Date(bookingDate),
      bookingTime,
      status: "WAITING",
      isActive: true,
    });

    if (existingWaitlist) {
      return res.status(400).json({
        success: false,
        message: "You are already in the waitlist for this time",
      });
    }

    const waitlist = await Waitlist.create({
      restaurantId,
      customerId: req.user._id,
      bookingDate: new Date(bookingDate),
      bookingTime,
      guests: Number(guests),
      specialRequest: specialRequest || "",
    });

    return res.status(201).json({
      success: true,
      message: "Joined waitlist successfully",
      data: waitlist,
    });
  } catch (error) {
    console.error("Join Waitlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET MY WAITLIST
const getMyWaitlist = async (req, res) => {
  try {
    const waitlists = await Waitlist.find({
      customerId: req.user._id,
      isActive: true,
    })
      .populate("restaurantId", "name city cuisine")
      .sort({ bookingDate: 1, bookingTime: 1 });

    return res.status(200).json({
      success: true,
      count: waitlists.length,
      data: waitlists,
    });
  } catch (error) {
    console.error("Get My Waitlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// GET ALL WAITLIST
const getAllWaitlist = async (req, res) => {
  try {
    const waitlists = await Waitlist.find({
      isActive: true,
    })
      .populate("restaurantId", "name city cuisine")
      .populate("customerId", "fullName email phone")
      .sort({ bookingDate: 1, bookingTime: 1 });

    return res.status(200).json({
      success: true,
      count: waitlists.length,
      data: waitlists,
    });
  } catch (error) {
    console.error("Get All Waitlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// UPDATE WAITLIST STATUS
const updateWaitlistStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "WAITING",
      "NOTIFIED",
      "SEATED",
      "CANCELLED",
      "EXPIRED",
    ];

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waitlist status",
      });
    }

    const waitlist = await Waitlist.findOne({
      _id: id,
      isActive: true,
    });

    if (!waitlist) {
      return res.status(404).json({
        success: false,
        message: "Waitlist entry not found",
      });
    }

    const restaurant = await Restaurant.findById(
      waitlist.restaurantId
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (
      req.user.role !== "SUPER_ADMIN" &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized for this restaurant",
      });
    }

    waitlist.status = status;

    await waitlist.save();

    return res.status(200).json({
      success: true,
      message: "Waitlist status updated successfully",
      data: waitlist,
    });
  } catch (error) {
    console.error("Update Waitlist Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

// LEAVE WAITLIST
const leaveWaitlist = async (req, res) => {
  try {
    const { id } = req.params;

    const waitlist = await Waitlist.findOne({
      _id: id,
      customerId: req.user._id,
      isActive: true,
    });

    if (!waitlist) {
      return res.status(404).json({
        success: false,
        message: "Waitlist entry not found",
      });
    }

    waitlist.status = "CANCELLED";
    waitlist.isActive = false;

    await waitlist.save();

    return res.status(200).json({
      success: true,
      message: "You have left the waitlist successfully",
    });
  } catch (error) {
    console.error("Leave Waitlist Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  joinWaitlist,
  getMyWaitlist,
  getAllWaitlist,
  updateWaitlistStatus,
  leaveWaitlist,
};
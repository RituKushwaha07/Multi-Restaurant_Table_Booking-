const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const restaurantTimingRoutes = require("./routes/restaurantTimingRoutes");
const menuCategoryRoutes = require("./routes/menuCategoryRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const tableRoutes = require("./routes/tableRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");


// Load Environment Variables
dotenv.config();

// Connect Database
connectDB();

// Create Express App
const app = express();


app.use(cors());
// Middleware
app.use(express.json());


app.use("/api/auth",authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/restaurant-timings", restaurantTimingRoutes);
app.use("/api/menu-categories", menuCategoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/bookings",bookingRoutes);
app.use("/api/order", orderRoutes)
app.use("/api/payment", paymentRoutes);


// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
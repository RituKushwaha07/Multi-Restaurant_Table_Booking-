require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/User");

const createSuperAdmin = async () => {
    try {
        await connectDB();

        // Check if SUPER_ADMIN already exists
        const existingAdmin = await User.findOne({
            role: "SUPER_ADMIN"
        });

        if (existingAdmin) {
            console.log("SUPER_ADMIN already exists:");
            console.log(existingAdmin.email);

            process.exit(0);
        }

        // Admin password
        const hashedPassword = await bcrypt.hash("123456", 10);

        const admin = await User.create({
            fullName: "Super Admin",
            email: "admin@restaurant.com",
            phone: "9999999999",
            password: hashedPassword,
            role: "SUPER_ADMIN",
            restaurantId: null,
            profileImage: "",
            isVerified: true,
            isActive: true
        });

        console.log("=================================");
        console.log("SUPER_ADMIN CREATED SUCCESSFULLY");
        console.log("=================================");
        console.log("Email:", admin.email);
        console.log("Password: 123456");
        console.log("Role:", admin.role);
        console.log("=================================");

        process.exit(0);

    } catch (error) {
        console.error("❌ Error creating SUPER_ADMIN");
        console.error(error.message);

        process.exit(1);
    }
};

createSuperAdmin();
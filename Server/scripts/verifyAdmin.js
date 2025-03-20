const mongoose = require("mongoose");
const connectDB = require("../Database/db");
const User = require("../Models/User");
const bcrypt = require("bcrypt");

// Connect to MongoDB
const runVerification = async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Find admin user
    const admin = await User.findOne({ username: "admin" });

    if (!admin) {
      console.log("Admin user not found! Creating one now...");

      // Create admin user using the User schema's pre-save hook
      const newAdmin = new User({
        username: "admin",
        password: "Admin@123", // Will be hashed by pre-save hook
        email: "admin@example.com",
        role: "admin",
        createdAt: new Date(),
      });

      await newAdmin.save();
      console.log("Admin user created successfully!");

      // Verify the password works
      const isMatch = await newAdmin.comparePassword("Admin@123");
      console.log("Password match test:", isMatch ? "PASS" : "FAIL");
    } else {
      console.log("Admin user exists:");
      console.log({
        username: admin.username,
        email: admin.email,
        role: admin.role,
        passwordEncrypted: !!admin.password,
      });

      // Test password comparison using the model method
      const isMatch = await admin.comparePassword("Admin@123");
      console.log("Password match test:", isMatch ? "PASS" : "FAIL");

      if (!isMatch) {
        console.log("Password mismatch detected. Updating password...");
        admin.password = "Admin@123"; // Will be hashed by pre-save hook
        await admin.save();
        console.log("Password has been reset to 'Admin@123'");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
};

runVerification().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});

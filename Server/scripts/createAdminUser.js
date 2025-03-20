const connectDB = require("../Database/db");
const mongoose = require("mongoose");
const User = require("../Models/User");

const createAdmin = async () => {
  try {
    // Connect to the database using the same connection module as the main app
    await connectDB();
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create new admin user
    const admin = new User({
      username: "admin",
      password: "Admin@123", // The pre-save hook in User model will hash this
      email: "admin@example.com",
      role: "admin",
    });

    await admin.save();

    // Verify the user was created
    const createdAdmin = await User.findOne({ username: "admin" });
    if (createdAdmin) {
      console.log("Admin user created successfully");
    } else {
      console.log("Failed to create admin user");
    }
  } catch (error) {
    console.error("Error creating admin:", error);
  } finally {
    console.log("Disconnecting from MongoDB...");
    // Use proper disconnect pattern
    await mongoose.connection.close();
    console.log("MongoDB connection closed");
    process.exit(0);
  }
};

// Execute and properly handle the promise
createAdmin().catch((err) => {
  console.error("Unhandled error:", err);
  process.exit(1);
});

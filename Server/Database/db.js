const mongoose = require("mongoose");

const userName = "1111"; // Replace with your username
const Password = "1111"; // Replace with your password
const database = "study-platform"; // Replace with your database name

// MongoDB connection string
const mongoURI = `mongodb+srv://${userName}:${Password}@${database}.hpq9ixn.mongodb.net/`;


const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log("MongoDB connected!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};

mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to DB Cluster");
});

mongoose.connection.on("error", (error) => {
  console.error("Mongoose connection error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;

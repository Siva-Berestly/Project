const mongoose = require("mongoose");

const userName = "enter your username here"; // Replace with your username
const Password = "enter your password here"; // Replace with your password
const database = "enter your database name here"; // Replace with your database name

// MongoDB connection string
const mongoURI = `mongodb+srv://${userName}:${Password}@study-platform.rto1i.mongodb.net/${database}?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
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

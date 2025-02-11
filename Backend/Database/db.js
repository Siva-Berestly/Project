const mongoose = require("mongoose");

const userName = "sivanesan";
const Password = "sivanesan123";

// MongoDB connection string
const mongoURI = `mongodb+srv://${userName}:${Password}@study-platform.rto1i.mongodb.net/`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
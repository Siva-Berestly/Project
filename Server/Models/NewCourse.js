const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
  hid: Number,
  heading: String,
  tcontent: String,
  vcontent: String,
});

const CourseSchema = new mongoose.Schema({
  id: Number,
  title: String,
  sections: [SectionSchema],
});

const Course = mongoose.model("NewCourse", CourseSchema);

module.exports = Course;

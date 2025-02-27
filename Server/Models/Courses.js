const mongoose = require("mongoose");
const { Schema } = mongoose;

const stepsSchema = new Schema({
  title: String,
  description: String,
  textContent: String,
  videoUrl: String,
});

const sectionSchema = new Schema({
  name: String,
  steps: [stepsSchema],
});

const courseSchema = new Schema({
  name: String,
  sections: [sectionSchema],
});

const Courses = mongoose.model("Courses", courseSchema);

module.exports = { Courses };

const mongoose = require("mongoose");

const CounterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", CounterSchema);

const SectionSchema = new mongoose.Schema({
  hid: { type: Number }, // Remove required constraint
  heading: { type: String, required: true },
  tcontent: { type: String, required: true },
  vcontent: String,
});

// Add a pre-validate hook to handle hid assignment
SectionSchema.pre("validate", function (next) {
  // If hid is not set, don't worry - it will be set by the parent document
  next();
});

const CourseSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  title: { type: String, required: true },
  sections: [SectionSchema],
});

// Pre-save middleware to auto-increment the `id` field for courses
CourseSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Course" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.count;
  }

  // Assign sequential hid values to new sections
  for (const section of this.sections) {
    if (!section.hid) {
      const counter = await Counter.findOneAndUpdate(
        { model: "Section" },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
      );
      section.hid = counter.count;
    }
  }

  next();
});

const Course = mongoose.model("NewCourse", CourseSchema);

module.exports = Course;

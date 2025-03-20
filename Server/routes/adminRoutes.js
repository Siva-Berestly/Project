const express = require("express");
const router = express.Router();
const NewCourse = require("../Models/NewCourse");

// Get all courses
router.get("/courses", async (req, res) => {
  try {
    const courses = await NewCourse.find();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get specific section from a course
router.get("/courses/:courseId/sections/:headingId", async (req, res) => {
  try {
    const { courseId, headingId } = req.params;
    const course = await NewCourse.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    const section = course.sections.find((section) => section.hid == headingId);
    if (!section) {
      return res.status(404).json({ message: "Section not found" });
    }
    res.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add new course
router.post("/courses", async (req, res) => {
  try {
    const { id, title, sections } = req.body;

    // Check if course with same ID already exists
    const existingCourse = await NewCourse.findOne({ id });
    if (existingCourse) {
      return res
        .status(400)
        .json({ message: "Course with this ID already exists" });
    }

    const newCourse = new NewCourse({ id, title, sections: sections || [] });
    await newCourse.save();

    res.status(201).json(newCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete course
router.delete("/courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await NewCourse.findOneAndDelete({ id: courseId });

    if (!result) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: error.message });
  }
});

// Add new section to a course
router.post("/courses/:courseId/sections", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { heading, content, hid, vcontent, tcontent } = req.body;

    // Validate required fields
    if (!heading || !content || !hid) {
      return res
        .status(400)
        .json({ message: "Heading, content, and hid are required" });
    }

    // Check if course exists
    const course = await NewCourse.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if section with same hid already exists
    const sectionExists = course.sections.some((section) => section.hid == hid);
    if (sectionExists) {
      return res
        .status(400)
        .json({ message: "Section with this ID already exists" });
    }

    // Add new section (using both tcontent and vcontent)
    course.sections.push({
      heading,
      content,
      tcontent: tcontent || content, // Use tcontent if provided, otherwise use content
      hid,
      vcontent: vcontent || "", // Make sure vcontent is included with default empty string
    });
    await course.save();

    res.status(201).json(course);
  } catch (error) {
    console.error("Error adding section:", error);
    res.status(500).json({ message: error.message });
  }
});

// Delete section from a course
router.delete("/courses/:courseId/sections/:sectionId", async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;

    // Check if course exists
    const course = await NewCourse.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if section exists
    const sectionIndex = course.sections.findIndex(
      (section) => section.hid == sectionId
    );
    if (sectionIndex === -1) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Remove section
    course.sections.splice(sectionIndex, 1);
    await course.save();

    res.json({ message: "Section deleted successfully" });
  } catch (error) {
    console.error("Error deleting section:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const NewCourse = require("../Models/NewCourse");
const User = require("../Models/User");
const jwt = require("jsonwebtoken");

// Add this constant
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Helper function to extract user ID from token
const getUserIdFromToken = (req) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return null;
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch (error) {
    console.error("Error extracting user ID from token:", error);
    return null;
  }
};

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
    const { heading, content, vcontent } = req.body;

    // Validate required fields - remove hid requirement
    if (!heading || !content) {
      return res
        .status(400)
        .json({ message: "Heading and content are required" });
    }

    // Check if course exists
    const course = await NewCourse.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Add new section without specifying hid (it will be auto-incremented)
    course.sections.push({
      heading,
      tcontent: content, // Map content to tcontent field
      vcontent: vcontent || "",
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

// Update course
router.put("/courses/:courseId", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Course title is required" });
    }

    const course = await NewCourse.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.title = title;
    await course.save();

    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: error.message });
  }
});

// Alternative POST endpoint for course updates (fallback if PUT doesn't work)
router.post("/courses/:courseId/update", async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Course title is required" });
    }

    const course = await NewCourse.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.title = title;
    await course.save();

    res.json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    res.status(500).json({ message: error.message });
  }
});

// Update section in a course
router.put("/courses/:courseId/sections/:sectionId", async (req, res) => {
  try {
    const { courseId, sectionId } = req.params;
    const { heading, content, vcontent } = req.body;

    // Validate required fields
    if (!heading || !content) {
      return res
        .status(400)
        .json({ message: "Section heading and content are required" });
    }

    // Find the course
    const course = await NewCourse.findOne({ id: courseId });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Find the section within the course
    const sectionIndex = course.sections.findIndex(
      (section) => section.hid == sectionId
    );
    if (sectionIndex === -1) {
      return res.status(404).json({ message: "Section not found" });
    }

    // Update the section
    course.sections[sectionIndex].heading = heading;
    course.sections[sectionIndex].tcontent = content;
    course.sections[sectionIndex].vcontent = vcontent || "";

    // Save the updated course
    await course.save();
    res.json({ message: "Section updated successfully", course });
  } catch (error) {
    console.error("Error updating section:", error);
    res.status(500).json({ message: error.message });
  }
});

// Alternative POST endpoint for section updates (fallback if PUT doesn't work)
router.post(
  "/courses/:courseId/sections/:sectionId/update",
  async (req, res) => {
    try {
      const { courseId, sectionId } = req.params;
      const { heading, content, vcontent } = req.body;

      // Validate required fields
      if (!heading || !content) {
        return res
          .status(400)
          .json({ message: "Section heading and content are required" });
      }

      // Find the course
      const course = await NewCourse.findOne({ id: courseId });
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }

      // Find the section within the course
      const sectionIndex = course.sections.findIndex(
        (section) => section.hid == sectionId
      );
      if (sectionIndex === -1) {
        return res.status(404).json({ message: "Section not found" });
      }

      // Update the section
      course.sections[sectionIndex].heading = heading;
      course.sections[sectionIndex].tcontent = content;
      course.sections[sectionIndex].vcontent = vcontent || "";

      // Save the updated course
      await course.save();
      res.json({ message: "Section updated successfully", course });
    } catch (error) {
      console.error("Error updating section:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Admin Settings Routes
router.put("/settings/email", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use by another account" });
    }

    // Update user's email
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.email = email;
    await user.save();

    res.json({ message: "Email updated successfully" });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ message: error.message });
  }
});

router.put("/settings/password", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current password and new password are required" });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Password validation
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Update password
    user.password = newPassword; // The pre-save hook will hash it
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: error.message });
  }
});

// Profile route to get user data
router.get("/profile", async (req, res) => {
  try {
    const userId = getUserIdFromToken(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Find user without returning the password
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error retrieving user profile:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

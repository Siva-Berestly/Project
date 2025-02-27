const express = require("express");
const connectDB = require("./Database/db");
const path = require("path");
const cors = require("cors");
const app = express();
const port = 3000;

const NewCourse = require("./Models/NewCourse");

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../Client/build")));

app.get("/api/newcourses", async (req, res) => {
  try {
    const courses = await NewCourse.find();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/newcourses/:courseId/sections/:headingId", async (req, res) => {
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

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const express = require("express");
const connectDB = require("./Database/db");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const app = express();
const port = process.env.PORT || 3000;

const NewCourse = require("./Models/NewCourse");

// Connect to MongoDB
connectDB();

// Configure CORS to explicitly allow requests from client
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use("/api/auth", authRoutes);

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

// The "catch-all" route should be last
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/build", "index.html"));
});

// Add error handling middleware to catch JSON parsing errors
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  res.status(500).json({
    message: "Server error",
    error: process.env.NODE_ENV === "production" ? {} : err.toString(),
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

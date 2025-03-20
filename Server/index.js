const express = require("express");
const connectDB = require("./Database/db");
const path = require("path");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
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
app.use("/api/admin", adminRoutes);

// Maintain backward compatibility with existing frontend code
// These routes redirect to the new admin routes
app.get("/api/newcourses", (req, res) => {
  res.redirect(307, "/api/admin/courses");
});

app.get("/api/newcourses/:courseId/sections/:headingId", (req, res) => {
  const { courseId, headingId } = req.params;
  res.redirect(307, `/api/admin/courses/${courseId}/sections/${headingId}`);
});

app.post("/api/newcourses", (req, res) => {
  res.redirect(307, "/api/admin/courses");
});

app.delete("/api/newcourses/:courseId", (req, res) => {
  const { courseId } = req.params;
  res.redirect(307, `/api/admin/courses/${courseId}`);
});

// Add redirects for section endpoints
app.post("/api/newcourses/:courseId/sections", (req, res) => {
  const { courseId } = req.params;
  res.redirect(307, `/api/admin/courses/${courseId}/sections`);
});

app.delete("/api/newcourses/:courseId/sections/:sectionId", (req, res) => {
  const { courseId, sectionId } = req.params;
  res.redirect(307, `/api/admin/courses/${courseId}/sections/${sectionId}`);
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../Client/build")));

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

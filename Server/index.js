const express = require("express");
const connectDB = require("./Database/db");
const path = require("path");
const cors = require("cors");
const upload = require("./multerConfig"); 
const app = express();
const port = 3000;

const Courses = require("./Models/Courses");

// Connect to MongoDB
connectDB()
  .then(() => console.log("MongoDB connected successfully"))
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

app.use(express.json());
app.use(cors());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../Client/build")));

// app.post("/api/upload", (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       res.status(400).json({ message: err });
//     } else {
//       if (req.file == undefined) {
//         res.status(400).json({ message: "No file selected!" });
//       } else {
//         res.json({
//           message: "File uploaded!",
//           file: `uploads/${req.file.filename}`,
//         });
//       }
//     }
//   });
// });

app.get("/api/courses", async (req, res) => {
  try {
    const courses = await Courses.find();
    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: error.message });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Client/build", "index.html"));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

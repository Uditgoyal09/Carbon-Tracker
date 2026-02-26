const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const morgan= require("morgan");

const tipRoutes = require("./routes/tips.routes");
const goalRoutes = require("./routes/goal.routes");
const authRoutes = require("./routes/auth.routes");
const activityRoutes = require("./routes/activity.routes");
const achievementRoutes = require("./routes/achievement.routes");
const userRoutes = require("./routes/user.routes");
const offsetRoutes = require("./routes/offset.routes");


const app = express();
connectDB();

app.use(cors({
  origin: "https://carbon-tracker-main.com",
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve profile pictures

// Routes
app.use("/api/tips", tipRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/offset", offsetRoutes);


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const path = require("path");
const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
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

const normalizeOrigin = (origin) => origin.replace(/\/$/, "");

const allowedOrigins = (process.env.CORS_ORIGINS ||
  "http://localhost:5173,http://localhost:5174,http://localhost:3000,https://carbon-tracker-lovat.vercel.app")
  .split(",")
  .map((origin) => origin.trim())
  .map((origin) => normalizeOrigin(origin))
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalizedOrigin = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalizedOrigin)) return true;

  // Allow local frontend dev servers on localhost/127.0.0.1, regardless of Vite port.
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(normalizedOrigin);
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static("uploads")); // Serve profile pictures

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Carbon Tracker Backend is running!", status: "OK" });
});

app.get("/healthz", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Routes
app.use("/api/tips", tipRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/users", userRoutes);
app.use("/api/offset", offsetRoutes);


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();

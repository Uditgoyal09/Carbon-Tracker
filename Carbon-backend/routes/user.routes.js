const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const User = require("../models/User");
const Activity = require("../models/Activity"); // Required for achievements
const bcrypt = require("bcryptjs");

const normalizeEmail = (email = "") => email.trim().toLowerCase();
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return passwordRegex.test(password);
};

// GET /api/users/me - Get current user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
});

// PUT /api/users/me - Update name/email/password
router.put("/me", verifyToken, async (req, res) => {
  try {
    const updates = {};
    const incomingName = req.body?.name?.trim();
    const incomingEmail = req.body?.email ? normalizeEmail(req.body.email) : "";
    const incomingPassword = req.body?.password?.trim();

    if (!incomingName) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!incomingEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(incomingEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email: incomingEmail, _id: { $ne: req.user.id } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    updates.name = incomingName;
    updates.email = incomingEmail;

    if (incomingPassword) {
      if (!validatePassword(incomingPassword)) {
        return res.status(400).json({
          message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character"
        });
      }

      updates.password = await bcrypt.hash(incomingPassword, 10);
    }

    const updated = await User.findByIdAndUpdate(req.user.id, { $set: updates }, { new: true }).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// POST /api/users/upload - Upload profile picture
router.post("/upload", verifyToken, upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePic: req.file.filename },
      { new: true }
    );
    res.json({ message: "Uploaded", profilePic: user.profilePic });
  } catch (err) {
    res.status(500).json({ message: "Failed to upload profile picture" });
  }
});

// GET /api/users/achievements - Get achievements for the current user
router.get("/achievements", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    const activities = await Activity.find({ userId });

    const achievements = [];
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);

    const totalCO2 = activities.reduce((sum, act) => sum + act.kg, 0);


    if (!user.hasLoggedIn) {
      achievements.push("🎉 First Login");
      user.hasLoggedIn = true;
      await user.save();
    }

    if (activities.length >= 1) {
      achievements.push("🌱 Eco Starter");
    }
    if (user.goal && totalCO2 < user.goal) {
      achievements.push("🥇 Under Goal Champion");
    }

    // ♻️ Weekly Logger Badge
    const recentActivities = activities.filter((act) => new Date(act.createdAt) >= oneWeekAgo);
    if (recentActivities.length > 0) {
      achievements.push("♻️ Weekly Logger");
    }

    res.json({ achievements });
  } catch (err) {
    console.error("Error generating achievements", err);
    res.status(500).json({ message: "Failed to load achievements" });
  }
});

module.exports = router;

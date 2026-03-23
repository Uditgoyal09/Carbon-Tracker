const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 special character
const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
  return passwordRegex.test(password);
};

// Generate a 6-digit numeric OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const normalizeEmail = (email = "") => email.trim().toLowerCase();

// send otp
exports.sendOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const startedAt = Date.now();

  try {
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false,
      });
    }

    console.log("[Auth] OTP request started", { email });

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ email });
    if (user) {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.lastOtp = otp;
      user.lastOtpExpiry = otpExpiry;
      await user.save();
    } else {
      user = new User({
        email,
        otp,
        otpExpiry,
        lastOtp: otp,
        lastOtpExpiry: otpExpiry,
        isVerified: false,
      });
      await user.save();
    }

    try {
      await sendEmail(
        email,
        "Your Carbon Tracker OTP",
        `Your OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`
      );

      console.log("[Auth] OTP sent successfully", {
        email,
        durationMs: Date.now() - startedAt,
      });

      return res.status(200).json({
        message: "OTP sent to email successfully",
        success: true,
      });
    } catch (emailError) {
      console.error("[Auth] Failed to send OTP email", {
        email,
        durationMs: Date.now() - startedAt,
        code: emailError.code,
        message: emailError.message,
      });

      if (emailError.code === "EMAIL_CONFIG_MISSING" || emailError.code === "EMAIL_AUTH_FAILED") {
        return res.status(500).json({
          message: "Email service configuration error. Please contact support.",
          success: false,
          errorCode: emailError.code,
        });
      }

      if (emailError.code === "INVALID_EMAIL") {
        return res.status(400).json({
          message: "Invalid email address",
          success: false,
        });
      }

      if (emailError.code === "NETWORK_ERROR") {
        return res.status(503).json({
          message: "Email service temporarily unavailable. Please try again later.",
          success: false,
        });
      }

      return res.status(500).json({
        message: emailError.message || "Failed to send OTP email",
        success: false,
      });
    }
  } catch (err) {
    console.error("[Auth] SEND OTP ERROR", {
      email,
      message: err.message,
      stack: err.stack,
    });

    return res.status(500).json({
      message: "Error processing OTP request",
      error: err.message,
      success: false,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    return res.status(500).json({ message: "OTP verification error", error: err.message });
  }
};

exports.register = async (req, res) => {
  const name = req.body?.name?.trim();
  const email = normalizeEmail(req.body?.email);
  const { password } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Please verify your email first" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    if (user.password) {
      return res.status(400).json({ message: "User already registered" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.name = name;
    user.password = hashedPassword;
    await user.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Registration error", error: err.message });
  }
};

exports.login = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Please complete registration first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.hasLoggedIn) {
      user.hasLoggedIn = true;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: "Login error", error: err.message });
  }
};

// Forgot Password - Send OTP
exports.forgotPasswordOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const startedAt = Date.now();

  try {
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
        success: false,
      });
    }

    console.log("[Auth] Password reset OTP request started", { email });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Please complete registration first",
        success: false,
      });
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.lastOtp = otp;
    user.lastOtpExpiry = otpExpiry;
    await user.save();

    try {
      await sendEmail(
        email,
        "Carbon Tracker - Password Reset OTP",
        `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`
      );

      console.log("[Auth] Password reset OTP sent successfully", {
        email,
        durationMs: Date.now() - startedAt,
      });

      return res.status(200).json({
        message: "Password reset OTP sent to email successfully",
        success: true,
      });
    } catch (emailError) {
      console.error("[Auth] Failed to send password reset OTP", {
        email,
        durationMs: Date.now() - startedAt,
        code: emailError.code,
        message: emailError.message,
      });

      if (emailError.code === "EMAIL_CONFIG_MISSING" || emailError.code === "EMAIL_AUTH_FAILED") {
        return res.status(500).json({
          message: "Email service configuration error. Please contact support.",
          success: false,
          errorCode: emailError.code,
        });
      }

      if (emailError.code === "INVALID_EMAIL") {
        return res.status(400).json({
          message: "Invalid email address",
          success: false,
        });
      }

      if (emailError.code === "NETWORK_ERROR") {
        return res.status(503).json({
          message: "Email service temporarily unavailable. Please try again later.",
          success: false,
        });
      }

      return res.status(500).json({
        message: emailError.message || "Failed to send password reset OTP",
        success: false,
      });
    }
  } catch (err) {
    console.error("[Auth] FORGOT PASSWORD OTP ERROR", {
      email,
      message: err.message,
      stack: err.stack,
    });

    return res.status(500).json({
      message: "Error processing password reset request",
      error: err.message,
      success: false,
    });
  }
};

// Verify Forgot Password OTP
exports.verifyForgotOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    return res.status(500).json({ message: "OTP verification error", error: err.message });
  }
};

// Reset Password (after OTP verification)
exports.resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.json({ message: "Password reset successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Password reset error", error: err.message });
  }
};

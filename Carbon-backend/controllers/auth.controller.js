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
  try {
    // Validate email input
    if (!email) {
      return res.status(400).json({ 
        message: "Email is required",
        success: false 
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format",
        success: false 
      });
    }

    console.log(`📧 OTP Request for: ${email}`);
    
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
        isVerified: false
      });
      await user.save();
    }

    // Send OTP via email
    try {
      await sendEmail(
        email,
        "Your Carbon Tracker OTP",
        `Your OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`
      );
      console.log(`✅ OTP sent successfully to ${email}`);
      res.status(200).json({ 
        message: "OTP sent to email successfully",
        success: true 
      });
    } catch (emailError) {
      // If email fails, still let user know but indicate the issue
      console.error(`❌ Failed to send OTP email to ${email}:`, emailError.message);
      
      // Handle specific email errors
      if (emailError.code === "EMAIL_CONFIG_MISSING" || emailError.code === "EMAIL_AUTH_FAILED") {
        return res.status(500).json({ 
          message: "Email service configuration error. Please contact support.",
          success: false,
          errorCode: emailError.code 
        });
      } else if (emailError.code === "INVALID_EMAIL") {
        return res.status(400).json({ 
          message: "Invalid email address",
          success: false 
        });
      } else if (emailError.code === "NETWORK_ERROR") {
        return res.status(503).json({ 
          message: "Email service temporarily unavailable. Please try again later.",
          success: false 
        });
      } else {
        return res.status(500).json({ 
          message: emailError.message || "Failed to send OTP email",
          success: false 
        });
      }
    }
  } catch (err) {
    console.error("❌ SEND OTP ERROR:", err.message);
    res.status(500).json({
      message: "Error processing OTP request",
      error: err.message,
      success: false
    });
  }
};


exports.verifyOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { otp } = req.body;
  try {
    const user = await User.findOne({ email }); //find user form the database
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Mark as verified and clear OTP fields
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification error", error: err.message });
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

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    // Check if already registered (has password)
    if (user.password) {
      return res.status(400).json({ message: "User already registered" });
    }

    // Validate password strength
    if (!validatePassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character"
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.name = name;
    user.password = hashedPassword;
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Registration error", error: err.message });
  }
};


exports.login = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Check if email is verified
    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    if (!user.password) {
      return res.status(400).json({ message: "Please complete registration first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (!user.hasLoggedIn) {
      user.hasLoggedIn = true;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

// Forgot Password - Send OTP
exports.forgotPasswordOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  try {
    // Validate email input
    if (!email) {
      return res.status(400).json({ 
        message: "Email is required",
        success: false 
      });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format",
        success: false 
      });
    }

    console.log(`🔐 Password Reset OTP Request for: ${email}`);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: "User not found",
        success: false 
      });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "Please complete registration first",
        success: false
      });
    }

    // Generate OTP and set expiry (10 minutes)
    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.lastOtp = otp;
    user.lastOtpExpiry = otpExpiry;
    await user.save();

    // Send OTP via email
    try {
      await sendEmail(
        email,
        "Carbon Tracker - Password Reset OTP",
        `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you did not request this, please ignore this email.`
      );
      console.log(`✅ Password reset OTP sent successfully to ${email}`);
      res.status(200).json({ 
        message: "Password reset OTP sent to email successfully",
        success: true 
      });
    } catch (emailError) {
      console.error(`❌ Failed to send password reset OTP to ${email}:`, emailError.message);
      
      // Handle specific email errors
      if (emailError.code === "EMAIL_CONFIG_MISSING" || emailError.code === "EMAIL_AUTH_FAILED") {
        return res.status(500).json({ 
          message: "Email service configuration error. Please contact support.",
          success: false,
          errorCode: emailError.code 
        });
      } else if (emailError.code === "INVALID_EMAIL") {
        return res.status(400).json({ 
          message: "Invalid email address",
          success: false 
        });
      } else if (emailError.code === "NETWORK_ERROR") {
        return res.status(503).json({ 
          message: "Email service temporarily unavailable. Please try again later.",
          success: false 
        });
      } else {
        return res.status(500).json({ 
          message: emailError.message || "Failed to send password reset OTP",
          success: false 
        });
      }
    }
  } catch (err) {
    console.error("❌ FORGOT PASSWORD OTP ERROR:", err.message);
    res.status(500).json({ 
      message: "Error processing password reset request",
      error: err.message,
      success: false 
    });
  }
};

//  Verify Forgot Password OTP
exports.verifyForgotOtp = async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const { otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Validate OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Check OTP expiry
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    res.status(500).json({ message: "OTP verification error", error: err.message });
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

    // Validate password strength
    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character"
      });
    }

    // Hash password and clear OTP fields
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password reset error", error: err.message });
  }
};

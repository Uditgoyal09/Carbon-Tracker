const mongoose = require("mongoose"); // ✅ Add this line at the top

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: null
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true
  },
  password: {
    type: String,
    default: null
  },
  hasLoggedIn: {
    type: Boolean,
    default: false,
  },
  goal: {
    type: Number,
    default: 100,
  },
  weeklyGoal: {
    type: Number,
    default: 50 
  },
  
  // OTP-based email verification fields
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  lastOtp: {
    type: String,
    default: null
  },
  lastOtpExpiry: {
    type: Date,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  }
  
}, { timestamps: true });


module.exports = mongoose.model("User", userSchema);

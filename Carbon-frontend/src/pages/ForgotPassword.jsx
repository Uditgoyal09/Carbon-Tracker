import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaKey,
  FaLock,
  FaCheckCircle,
  FaLeaf,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import API_BASE_URL from "../config/api";

function ForgotPassword() {
  const [step, setStep] = useState("email"); // email | otp | reset | success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const stepOrder = ["email", "otp", "reset", "success"];
  const currentStepIndex = stepOrder.indexOf(step);

  const handleOtpChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
      toast.success("OTP sent to your email successfully.");
      setStep("otp");
    } catch (err) {
      toast.error(err.response?.data?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/verify-forgot-otp`, { email, otp });
      toast.success("OTP verified successfully.");
      setStep("reset");
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/reset-password`, {
        email,
        newPassword,
      });
      toast.success("Password reset successful. You can now log in.");
      setStep("success");
    } catch (err) {
      toast.error(err.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case "email":
        return "Recover account";
      case "otp":
        return "Verify OTP";
      case "reset":
        return "Create new password";
      case "success":
        return "All set";
      default:
        return "Recover account";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case "email":
        return "Enter your email to receive a one-time verification code.";
      case "otp":
        return "Enter the 6-digit code sent to your inbox.";
      case "reset":
        return "Set a strong password for your account.";
      case "success":
        return "Your password has been updated successfully.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-cyan-50 to-slate-100 flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-emerald-300/30 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-96 h-96 rounded-full bg-cyan-300/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-teal-200/30 blur-3xl" />
      </div>

      <motion.div
        className="z-10 w-full max-w-5xl rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(15,23,42,0.15)] overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="grid md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 text-white">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/30 text-sm">
                <FaLeaf className="text-emerald-200" />
                Carbon Tracker
              </div>
              <h2 className="mt-6 text-3xl lg:text-4xl font-bold leading-tight">
                Password reset made simple and secure
              </h2>
              <p className="mt-3 text-emerald-100 text-sm leading-relaxed">
                Verify your email, confirm OTP, and set a new password in a quick 3-step flow.
              </p>
            </div>

            <div className="space-y-3">
              {["Enter email", "Verify OTP", "Set new password"].map((item, idx) => (
                <div key={item} className="flex items-center gap-3 text-sm text-emerald-100">
                  <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <div className="flex flex-col items-center md:items-start mb-7">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg shadow-emerald-200 mb-3">
                {step === "email" && <FaEnvelope className="text-xl text-white" />}
                {step === "otp" && <FaKey className="text-xl text-white" />}
                {step === "reset" && <FaLock className="text-xl text-white" />}
                {step === "success" && <FaCheckCircle className="text-xl text-white" />}
              </div>
              <h1 className="text-3xl font-bold text-slate-900">{getStepTitle()}</h1>
              <p className="text-sm text-slate-500 text-center md:text-left mt-1">{getStepDescription()}</p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              {stepOrder.map((s, idx) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all ${
                    idx <= currentStepIndex ? "bg-emerald-500 w-10" : "bg-slate-200 w-8"
                  }`}
                />
              ))}
            </div>

            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Email Address</label>
                  <div className="absolute inset-y-0 left-0 top-6 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
                <p className="mt-4 text-center text-sm text-slate-600">
                  Remember your password?{" "}
                  <Link to="/login" className="text-emerald-700 hover:underline font-semibold">
                    Login
                  </Link>
                </p>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Email Address</label>
                  <div className="absolute inset-y-0 left-0 top-6 pl-4 flex items-center pointer-events-none">
                    <FaEnvelope className="text-slate-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
                    value={email}
                    readOnly
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">OTP Code</label>
                  <div className="absolute inset-y-0 left-0 top-6 pl-4 flex items-center pointer-events-none">
                    <FaKey className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 tracking-[0.3em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={6}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
                <p className="text-center text-sm text-slate-600">
                  Did not receive the code?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-emerald-700 hover:underline font-semibold"
                  >
                    Resend OTP
                  </button>
                </p>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">New Password</label>
                  <div className="absolute inset-y-0 left-0 top-6 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-slate-400" />
                  </div>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    className="absolute right-3 top-[2.35rem] text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Confirm Password</label>
                  <div className="absolute inset-y-0 left-0 top-6 pl-4 flex items-center pointer-events-none">
                    <FaLock className="text-slate-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute right-3 top-[2.35rem] text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                  <FaCheckCircle />
                </div>
                <p className="text-slate-600">You can now sign in with your new password.</p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  Go to Login
                  <FaArrowRight />
                </Link>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPassword;

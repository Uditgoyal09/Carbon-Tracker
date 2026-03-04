import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaKey,
  FaLeaf,
  FaCheckCircle,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config/api";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "otp" && (!/^\d*$/.test(value) || value.length > 6)) {
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSendOtp = async () => {
    if (!form.email) {
      toast.error("Please enter your email first", { autoClose: 3000 });
      return;
    }
    try {
      setSendingOtp(true);
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { //route
        email: form.email,
      });
      setOtpSent(true);
      toast.success("OTP sent to your email!", { autoClose: 2000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP", {
        autoClose: 3000,
      });
    } finally {
      setSendingOtp(false);
    }
  };


  const handleVerifyOtp = async () => {
    if (form.otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP", { autoClose: 3000 });
      return;
    }
    try {
      setVerifyingOtp(true);
      await axios.post(`${API_BASE_URL}/api/auth/verify-otp`, {
        email: form.email,
        otp: form.otp,
      });
      setOtpVerified(true);
      toast.success("Email verified successfully!", { autoClose: 2000 });
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP verification failed", {
        autoClose: 3000,
      });
    } finally {
      setVerifyingOtp(false);
    }
  };

  
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otpVerified) {
      toast.error("Please verify your email first", { autoClose: 3000 });
      return;
    }
    try {
      setRegistering(true);
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success("Registered successfully! You can now log in.", {
        autoClose: 2000,
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed", {
        autoClose: 3000,
      });
    } finally {
      setRegistering(false);
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
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700 text-white relative">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/30 text-sm">
                <FaLeaf className="text-emerald-200" />
                Carbon Tracker
              </div>
              <h2 className="mt-6 text-3xl lg:text-4xl font-bold leading-tight">
                Create your account and start reducing your footprint
              </h2>
              <p className="mt-3 text-emerald-100 text-sm leading-relaxed">
                Verify email, set goals, and track your sustainable progress in one place.
              </p>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-emerald-200">Quick Setup</p>
                <p className="text-2xl font-bold mt-1">Under 1 minute</p>
              </div>
              <div className="text-sm text-emerald-100 inline-flex items-center gap-2">
                <FaCheckCircle className="text-emerald-200" />
                OTP-protected verification flow
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <div className="flex flex-col items-center md:items-start mb-7">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg shadow-emerald-200 mb-3">
                <FaUser className="text-xl text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Create account</h1>
              <p className="text-sm text-slate-500 text-center md:text-left mt-1">
                Join and personalize your sustainability journey.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Full Name</label>
                <div className="absolute inset-y-0 left-0 top-6 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-500 ml-1">Email Address</label>
                <div className="flex items-stretch gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-slate-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className={`w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${
                        otpSent ? "bg-slate-50 text-slate-500" : ""
                      }`}
                      value={form.email}
                      onChange={handleChange}
                      readOnly={otpSent}
                      required
                    />
                  </div>

                  {!otpVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || !form.email}
                      className="px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-semibold hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-sm font-semibold whitespace-nowrap px-3">
                      <FaCheckCircle /> Verified
                    </span>
                  )}
                </div>
              </div>

              {otpSent && !otpVerified && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 space-y-3"
                >
                  <p className="text-xs text-emerald-800">
                    We sent a 6-digit code to your email.
                  </p>
                  <div className="flex items-stretch gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaKey className="text-slate-400" />
                      </div>
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter OTP"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 tracking-[0.3em] text-center font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                        value={form.otp}
                        onChange={handleChange}
                        maxLength={6}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || form.otp.length !== 6}
                      className="px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {verifyingOtp ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="relative">
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">Password</label>
                <div className="absolute inset-y-0 left-0 top-6 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a strong password"
                  className={`w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all ${
                    !otpVerified ? "bg-slate-50 text-slate-400" : ""
                  }`}
                  value={form.password}
                  onChange={handleChange}
                  disabled={!otpVerified}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-[2.35rem] text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!otpVerified || registering}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {registering ? (
                  "Creating account..."
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Create Account
                    <FaArrowRight />
                  </span>
                )}
              </button>

              <p className="mt-4 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="text-emerald-700 hover:underline font-semibold">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Register;

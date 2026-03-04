import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FaEnvelope,
  FaLock,
  FaLeaf,
  FaShieldAlt,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
} from "react-icons/fa";
import API_BASE_URL from "../../config/api";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`,{email,  password,});  //send data to the server

      localStorage.setItem("token", res.data.token);  //takeingg tocken form tghe login funcion
      onLogin(res.data.user);

      toast.success("Login successful!", { autoClose: 2000 });

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
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
                Welcome back to your sustainable dashboard
              </h2>
              <p className="mt-3 text-emerald-100 text-sm leading-relaxed">
                Track emissions, hit weekly goals, and stay consistent with your eco habits.
              </p>
            </div>
            <div className="space-y-3">
              <div className="rounded-2xl bg-white/10 border border-white/15 px-4 py-3">
                <p className="text-xs uppercase tracking-wider text-emerald-200">Impact Focus</p>
                <p className="text-2xl font-bold mt-1">CO2 Goals</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-100">
                <FaShieldAlt className="text-emerald-200" />
                Secure login with protected API access
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-100">
                <FaLeaf className="text-emerald-200" />
                Personalized insights and carbon reports
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <div className="flex flex-col items-center md:items-start mb-7">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-2xl shadow-lg shadow-emerald-200 mb-3">
                <FaEnvelope className="text-xl text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">Sign in</h1>
              <p className="text-sm text-slate-500 text-center md:text-left mt-1">
                Continue your carbon-reduction journey.
              </p>
            </div>

{/* //form */}
            <form onSubmit={handleLogin} className="space-y-5 mt-4">
              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">
                  Email Address
                </label>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaEnvelope className="text-slate-400 mt-4"  />
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="relative group">
                <label className="block text-xs font-semibold text-slate-500 mb-2 ml-1">
                  Password
                </label>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaLock className="text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 bg-white/95 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loading ? (
                  "Signing in..."
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Enter Dashboard
                    <FaArrowRight />
                  </span>
                )}
              </button>

              <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-xs text-emerald-800 inline-flex items-center gap-2">
                  <FaCheckCircle />
                  Your account data is encrypted and protected.
                </p>
              </div>

              <p className="mt-5 text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-emerald-700 hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;

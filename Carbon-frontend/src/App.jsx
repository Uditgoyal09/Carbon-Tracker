import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ToastContainer } from "react-toastify";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import VerifyOtp from "./components/Auth/VerifyOtp";
import ResetPassword from "./components/Auth/ResetPassword";
import ActivityForm from "./components/ActivityForm";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import Achievements from "./components/Achievements";
import ProfilePage from "./components/ProfilePage";
import Goals from "./pages/Goals";
import Home from "./pages/Home";
import Offset from "./pages/Offset";
import Navbar from "./components/Navbar";
import LearnMore from "./pages/LearnMore";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setUser({ token });
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    navigate("/");
  };

  const PrivateRoute = ({ element }) => {
    return user ? element : <Navigate to="/login" />;
  };

  // Hide navbar on these routes
  const hideNavbarRoutes = ["/login", "/register", "/forgot-password", "/verify-otp", "/reset-password"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="ui-modern min-h-screen">
      <div className="app-shell__backdrop" aria-hidden="true">
        <div className="app-shell__orb app-shell__orb--one" />
        <div className="app-shell__orb app-shell__orb--two" />
        <div className="app-shell__orb app-shell__orb--three" />
        <div className="app-shell__grid" />
      </div>
      {!shouldHideNavbar && <Navbar user={user} setUser={setUser} />}
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="relative z-10"
          initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Routes location={location}>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<PrivateRoute element={<Home />} />} />
            <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
            <Route path="/activity" element={<PrivateRoute element={<ActivityForm />} />} />
            <Route path="/goals" element={<PrivateRoute element={<Goals />} />} />
            <Route path="/achievements" element={<PrivateRoute element={<Achievements />} />} />
            <Route path="/leaderboard" element={<PrivateRoute element={<Leaderboard />} />} />
            <Route path="/profile" element={<PrivateRoute element={<ProfilePage />} />} />
            <Route path="/offset" element={<PrivateRoute element={<Offset />} />} />
            <Route path="/learn-more" element={<PrivateRoute element={<LearnMore />} />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
      <ToastContainer
        position="top-right"
        autoClose={2600}
        newestOnTop
        pauseOnFocusLoss={false}
        toastClassName={() => "app-toast"}
        progressClassName="app-toast__progress"
      />
    </div>
  );
}

export default App;

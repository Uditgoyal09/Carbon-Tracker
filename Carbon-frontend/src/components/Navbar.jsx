import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/Carbon Tracker.png";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollYRef.current;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const nextProgress = scrollableHeight > 0 ? Math.min(currentScrollY / scrollableHeight, 1) : 0;

      setIsAtTop(currentScrollY < 10);
      setScrollProgress(nextProgress);

      if (currentScrollY > previousScrollY && currentScrollY > 90) {
        setIsVisible(false);
      } else if (currentScrollY < previousScrollY) {
        setIsVisible(true);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setActionsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/goals", label: "Goals" },
    { to: "/achievements", label: "Achievements" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/profile", label: "Profile" },
  ];

  const actionLinks = [
    { to: "/activity", label: "Log Activity" },
    { to: "/offset", label: "Carbon Offset" },
  ];

  const desktopLinkClass = ({ isActive }) =>
    `relative text-[15px] font-medium px-3 py-1.5 rounded-2xl transition-all duration-200 ${
      isActive
        ? "text-emerald-950 bg-white/90 border border-white/80 shadow-[0_10px_30px_rgba(8,145,178,0.15)]"
        : "text-slate-700 hover:text-emerald-900 hover:bg-white/65"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block w-full px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-white text-emerald-900 border border-white/90 shadow-sm"
        : "text-slate-700 hover:bg-white/70 hover:text-emerald-800"
    }`;

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        onMouseEnter={() => setIsVisible(true)}
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isAtTop
              ? "bg-white/55 backdrop-blur-md"
              : "bg-white/78 backdrop-blur-2xl shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
          }`}
        />
        <div className="absolute inset-x-6 top-2 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        <motion.div
          className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-400"
          style={{ transformOrigin: "0% 50%" }}
          animate={{ scaleX: scrollProgress }}
          transition={{ duration: 0.12 }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/")}
              className="shrink-0 rounded-[1.4rem] p-1.5 hover:bg-white/60 transition-colors"
              aria-label="Go to home"
            >
              <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/70 bg-white/80 px-2.5 py-1.5 shadow-[0_16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <img
                  src={logo}
                  alt="Carbon Tracker logo"
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-full object-contain"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-900">CarbonTracker</p>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-emerald-700/80">Eco Intelligence</p>
                </div>
              </div>
            </button>

            <div className="hidden md:flex items-center gap-5 lg:gap-6">
              {links.slice(0, 2).map((item) => (
                <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
                  {item.label}
                </NavLink>
              ))}

              <div className="relative group">
                <button
                  className="relative text-[15px] font-medium text-slate-700 hover:text-emerald-900 px-3 py-1.5 rounded-2xl hover:bg-white/65 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Actions
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="min-w-[200px] rounded-[1.4rem] border border-white/80 bg-white/88 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-2">
                    {actionLinks.map((item) => (
                      <NavLink key={item.to} to={item.to} className={({ isActive }) => `block px-3 py-2.5 rounded-2xl text-sm font-medium transition-all ${isActive ? "bg-emerald-50 text-emerald-900 border border-emerald-100" : "text-slate-700 hover:bg-emerald-50/65 hover:text-emerald-800"}`}>
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>

              {links.slice(2).map((item) => (
                <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
                  {item.label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="hidden xl:flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-3 py-2 text-xs text-slate-600 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_6px_rgba(16,185,129,0.12)]" />
                Sustainable actions, ranked and visualized
              </div>

              <button
                onClick={user ? handleLogout : () => navigate("/login")}
                className="hidden sm:inline-flex items-center rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-sm font-semibold px-5 py-2.5 hover:from-emerald-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-emerald-200/60 transition-all duration-200"
              >
                {user ? "Logout" : "Login"}
              </button>

              <button
                onClick={() => setMobileOpen((prev) => !prev)}
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-emerald-100 bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-all"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mobileOpen && (
            <motion.div
              className="md:hidden mt-3 rounded-[1.7rem] border border-white/80 bg-white/88 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-3 space-y-1"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-cyan-50 px-4 py-3 text-sm text-slate-600">
                Navigate faster across dashboards, goals, achievements, and offset tools.
              </div>
              {links.slice(0, 2).map((item) => (
                <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
                  {item.label}
                </NavLink>
              ))}

              <button
                type="button"
                onClick={() => setActionsOpen((prev) => !prev)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-700 text-left inline-flex items-center justify-between transition-all"
              >
                <span>Actions</span>
                <svg className={`w-4 h-4 transition-transform ${actionsOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {actionsOpen && (
                <div className="pl-2 space-y-1">
                  {actionLinks.map((item) => (
                    <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}

              {links.slice(2).map((item) => (
                <NavLink key={item.to} to={item.to} className={mobileLinkClass}>
                  {item.label}
                </NavLink>
              ))}

              <button
                onClick={user ? handleLogout : () => navigate("/login")}
                className="w-full mt-2 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white text-sm font-semibold px-5 py-2.5 hover:from-emerald-700 hover:to-cyan-700 transition-all"
              >
                {user ? "Logout" : "Login"}
              </button>
            </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      <div className="h-[84px] sm:h-[92px]" />
    </>
  );
}

export default Navbar;

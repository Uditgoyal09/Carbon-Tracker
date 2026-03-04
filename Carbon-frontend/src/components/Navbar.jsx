import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/Carbon Tracker.png";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [isAtTop, setIsAtTop] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const previousScrollY = lastScrollYRef.current;

      setIsAtTop(currentScrollY < 10);

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
    `relative text-[15px] font-medium px-3 py-1.5 rounded-xl transition-all duration-200 ${
      isActive
        ? "text-emerald-700 bg-emerald-50 border border-emerald-100 shadow-sm"
        : "text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
        : "text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-700"
    }`;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isVisible ? "translate-y-0" : "-translate-y-full"
        }`}
        onMouseEnter={() => setIsVisible(true)}
      >
        <div
          className={`absolute inset-0 transition-all duration-300 ${
            isAtTop
              ? "bg-white/75 backdrop-blur-md"
              : "bg-white/92 backdrop-blur-xl shadow-md shadow-emerald-100/40"
          }`}
        />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200/60 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/")}
              className="shrink-0 rounded-2xl p-1 hover:bg-emerald-50 transition-colors"
              aria-label="Go to home"
            >
              <img
                src={logo}
                alt="Carbon Tracker logo"
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-contain"
              />
            </button>

            <div className="hidden md:flex items-center gap-5 lg:gap-6">
              {links.slice(0, 2).map((item) => (
                <NavLink key={item.to} to={item.to} className={desktopLinkClass}>
                  {item.label}
                </NavLink>
              ))}

              <div className="relative group">
                <button
                  className="relative text-[15px] font-medium text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-xl hover:bg-emerald-50/70 transition-all duration-200 inline-flex items-center gap-1"
                >
                  Actions
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="min-w-[180px] rounded-2xl border border-emerald-100 bg-white/95 backdrop-blur-lg shadow-xl shadow-emerald-100/40 p-2">
                    {actionLinks.map((item) => (
                      <NavLink key={item.to} to={item.to} className={({ isActive }) => `block px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-700"}`}>
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

            <div className="flex items-center gap-2">
              <button
                onClick={user ? handleLogout : () => navigate("/login")}
                className="hidden sm:inline-flex items-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold px-5 py-2.5 hover:from-emerald-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-emerald-200/60 transition-all duration-200"
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

          {mobileOpen && (
            <div className="md:hidden mt-3 rounded-2xl border border-emerald-100 bg-white/95 backdrop-blur-xl shadow-xl shadow-emerald-100/40 p-3 space-y-1">
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
                className="w-full mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold px-5 py-2.5 hover:from-emerald-700 hover:to-cyan-700 transition-all"
              >
                {user ? "Logout" : "Login"}
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="h-[84px] sm:h-[92px]" />
    </>
  );
}

export default Navbar;

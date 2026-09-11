import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, User } from "lucide-react";
import defaultProfileImg from "../../assets/images/profile.png";

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Packages", path: "/packages" },
    { name: "Hotels", path: "/hotels" },
    { name: "About Us", path: "/about" },
  ];

  const profilePath = currentUser
    ? `/profile/${currentUser.user_role === 1 ? "admin" : "user"}`
    : "/login";

  // Exact route matching helper for visible active indicator state
  const isLinkActive = (linkPath) => {
    const currentPath = location.pathname;
    if (linkPath === "/") {
      return currentPath === "/";
    }
    if (linkPath === "/packages") {
      return (
        currentPath.startsWith("/packages") ||
        currentPath.startsWith("/package/") ||
        currentPath === "/search"
      );
    }
    return currentPath === linkPath || currentPath.startsWith(linkPath);
  };

  return (
    <header className="fixed top-4 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto pointer-events-auto">
        <div
          className={`rounded-full transition-all duration-300 border flex items-center justify-between px-5 sm:px-6 ${
            scrolled
              ? "bg-white/70 backdrop-blur-2xl border-white/80 shadow-2xl py-2.5"
              : "bg-white/45 backdrop-blur-xl border-white/50 shadow-xl py-3"
          }`}
        >
          {/* Official Wadi Al Zaitoon Brand Logo Image */}
          <Link to="/" className="flex items-center shrink-0">
            <img
              src="/assets/logowadi.png"
              alt="Wadi Al Zaitoon"
              className="h-8 sm:h-9 object-contain"
            />
          </Link>

          {/* Desktop Navigation Links with Prominent 3px Coral Animated Underline */}
          <nav className="hidden lg:flex items-center gap-7 text-[11px] font-extrabold tracking-wider uppercase">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              return (
                <div key={link.name} className="relative py-1 flex flex-col items-center">
                  <Link
                    to={link.path}
                    className={`transition-colors duration-200 hover:text-emerald-800 relative z-10 ${
                      active ? "text-emerald-800 font-black" : "text-slate-900 font-extrabold"
                    }`}
                  >
                    {link.name}
                  </Link>
                  {active && (
                    <motion.span
                      layoutId="active-navbar-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-[3px] bg-emerald-600 rounded-full shadow-sm z-20"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {/* Desktop Actions: BOOK NOW & Profile */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              to="/packages/all"
              className="px-5 py-2 rounded-full bg-emerald-900 hover:bg-emerald-950 text-white font-extrabold text-[11px] tracking-wider uppercase transition-all shadow-md hover:shadow-lg transform active:scale-95"
            >
              BOOK NOW
            </Link>

            {currentUser ? (
              <Link
                to={profilePath}
                className="flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 hover:border-emerald-500 transition-colors bg-white shadow-sm text-slate-800 hover:text-emerald-600"
                title={currentUser.username}
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="p-2 rounded-full text-slate-700 hover:text-emerald-600 hover:bg-white/80 transition-colors"
                title="Sign In"
              >
                <User className="w-4 h-4" />
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/packages"
              className="px-3.5 py-1.5 rounded-full bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider shadow-sm"
            >
              BOOK NOW
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-slate-800 hover:bg-slate-100/80 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden mt-2 bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl p-5 shadow-2xl pointer-events-auto"
            >
              <div className="flex flex-col space-y-2.5">
                {navLinks.map((link) => {
                  const active = isLinkActive(link.path);
                  return (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`py-2.5 px-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-between ${
                        active
                          ? "bg-emerald-50 text-emerald-700 border-l-4 border-emerald-600 font-black shadow-sm"
                          : "text-slate-800 hover:bg-slate-50 hover:text-emerald-600"
                      }`}
                    >
                      <span>{link.name}</span>
                      {active && <span className="w-2 h-2 rounded-full bg-emerald-600 shadow-sm"></span>}
                    </Link>
                  );
                })}

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  {currentUser ? (
                    <Link
                      to={profilePath}
                      className="flex items-center gap-2.5 text-xs font-extrabold text-slate-800"
                    >
                      <div className="w-7 h-7 rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-700">
                        <User className="w-4 h-4" />
                      </div>
                      <span>{currentUser.username} ({currentUser.user_role === 1 ? "Admin" : "Member"})</span>
                    </Link>
                  ) : (
                    <Link
                      to="/login"
                      className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-center font-extrabold text-xs uppercase tracking-wider shadow-sm"
                    >
                      Sign In to Account
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;

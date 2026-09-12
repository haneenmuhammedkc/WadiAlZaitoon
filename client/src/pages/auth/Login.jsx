import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, CheckCircle2, ShieldAlert, ArrowRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [unverifiedState, setUnverifiedState] = useState(null);
  const { user: currentUser, login, loading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navMessage = location.state?.message || null;

  useEffect(() => {
    if (currentUser) {
      const targetPath =
        currentUser.user_role === 1 || currentUser.user_role === "admin" ? "/profile/admin" : "/";
      navigate(targetPath, { replace: true });
    }
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUnverifiedState(null);
    const result = await login(formData);
    if (result.success) {
      const loggedInUser = result.user;
      if (loggedInUser?.user_role === 1 || loggedInUser?.user_role === "admin") {
        navigate("/profile/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } else if (result.isEmailVerified === false) {
      setUnverifiedState({
        email: result.email || formData.email,
        message: result.message || "Your email is not verified yet.",
      });
    }
  };

  return (
    <PageTransition>
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <FadeIn>
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
              
              <div className="text-center space-y-2">
                <span className="text-xs uppercase tracking-widest font-extrabold text-coral-600">
                  Welcome Back
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Sign In to Account
                </h1>
                <p className="text-xs text-slate-500 font-normal">
                  Access your Wadi Al Zaitoon tour reservations and bookings.
                </p>
              </div>

              {navMessage && !error && !unverifiedState && (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{navMessage}</span>
                </div>
              )}

              {unverifiedState ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-2 text-amber-800 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Email Verification Required</span>
                  </div>
                  <p className="text-xs text-amber-700">
                    {unverifiedState.message}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/verify-email", {
                        state: { email: unverifiedState.email },
                      })
                    }
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Verify Your Email Now <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                error && (
                  <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 text-center">
                    {error}
                  </div>
                )
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Password</label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-bold text-coral-600 hover:underline"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 pr-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" />
                  {loading ? "Signing In..." : "SIGN IN NOW"}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
                <p>
                  Don't have an account?{" "}
                  <Link to="/signup" className="font-bold text-coral-600 hover:underline">
                    Create an Account
                  </Link>
                </p>
              </div>

            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;

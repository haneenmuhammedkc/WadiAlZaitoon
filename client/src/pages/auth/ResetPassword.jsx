import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, CheckCircle2, KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import { resetPassword } from "../../services/authService";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const resetToken = location.state?.resetToken || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Route guard: Redirect to /forgot-password if user tries to visit directly without OTP verification
  useEffect(() => {
    if (!email || !resetToken) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, resetToken, navigate]);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email || !resetToken) {
      setError("Password reset authorization missing. Please request a new verification code.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await resetPassword({ email, resetToken, newPassword });

      if (res.success === false) {
        setError(res.message || "Failed to reset password.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccessMsg("Password reset successfully! Redirecting...");

      setTimeout(() => {
        navigate("/password-reset-success", {
          replace: true,
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to reset password.");
      setLoading(false);
    }
  };

  if (!email || !resetToken) {
    return null;
  }

  return (
    <PageTransition>
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <FadeIn>
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-coral-50 text-coral-600 rounded-2xl flex items-center justify-center mx-auto border border-coral-100 mb-3">
                  <KeyRound className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-coral-600">
                  Password Recovery
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  CREATE NEW PASSWORD
                </h1>
                <p className="text-xs text-slate-500 font-normal">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200 text-center">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 text-center flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="newPassword"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                      required
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !newPassword || newPassword.length < 6 || !confirmPassword || !!successMsg}
                  className="w-full py-3.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    "Resetting Password..."
                  ) : (
                    <>
                      RESET PASSWORD <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </Link>
              </div>

            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default ResetPassword;

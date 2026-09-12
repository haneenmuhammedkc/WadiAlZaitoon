import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowRight, ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "../../services/authService";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await forgotPassword({ email });

      if (res.success === false) {
        setError(res.message || "Failed to process request.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccessMsg("If an account exists for this email, a verification code has been sent.");

      setTimeout(() => {
        navigate("/verify-reset-otp", {
          state: { email },
        });
      }, 1200);
    } catch (err) {
      setError(err.message || "Failed to process request.");
      setLoading(false);
    }
  };

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
                  Forgot Your Password?
                </h1>
                <p className="text-xs text-slate-500 font-normal">
                  Enter your email address and we'll send you a 6-digit verification code.
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

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-xs text-slate-900 focus:outline-none focus:border-coral-500"
                      required
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email || !!successMsg}
                  className="w-full py-3.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    "Sending Verification Code..."
                  ) : (
                    <>
                      Send Verification Code <ArrowRight className="w-4 h-4" />
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

export default ForgotPassword;

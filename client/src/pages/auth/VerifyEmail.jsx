import React, { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Mail, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { verifyEmail, resendOtp } from "../../services/authService";
import OtpInput from "../../components/auth/OtpInput";
import ResendTimer from "../../components/auth/ResendTimer";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const VerifyEmail = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract email from location state or URL search query fallback
  const initialEmail = location.state?.email || searchParams.get("email") || "";
  const [email] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await verifyEmail({ email, otp });

      if (res.success === false) {
        setError(res.message || "Invalid or expired verification code.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccessMsg(res.message || "Email verified successfully!");

      // Navigate to login after brief delay to show success
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { message: "Email verified successfully! You can now sign in." },
        });
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to verify email code.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await resendOtp({ email, purpose: "EMAIL_VERIFICATION" });

      if (res.success === false) {
        setError(res.message || "Failed to resend verification code.");
        return { success: false };
      }

      setSuccessMsg(res.message || "A new 6-digit verification code has been sent to your email.");
      return { success: true };
    } catch (err) {
      setError(err.message || "Failed to resend verification code.");
      return { success: false };
    }
  };

  if (!email) {
    return (
      <PageTransition>
        <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <FadeIn>
              <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl text-center space-y-6">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-slate-900">Email Address Required</h2>
                  <p className="text-xs text-slate-500">
                    No email address was provided for verification. Please register or sign in to continue.
                  </p>
                </div>
                <div className="flex gap-3 pt-2">
                  <Link
                    to="/signup"
                    className="flex-1 py-3 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider text-center transition-all shadow-sm"
                  >
                    Go to Register
                  </Link>
                  <Link
                    to="/login"
                    className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider text-center transition-all"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <FadeIn>
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-coral-50 text-coral-600 rounded-2xl flex items-center justify-center mx-auto border border-coral-100 mb-3">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-coral-600">
                  Email Verification
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Enter 6-Digit Code
                </h1>
                <p className="text-xs text-slate-500 font-normal">
                  We sent a 6-digit verification code to <br />
                  <strong className="text-slate-800 font-bold">{email}</strong>
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

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block text-center mb-1">
                    Verification Code
                  </label>
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    disabled={loading || !!successMsg}
                    error={!!error}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otp.length !== 6 || !!successMsg}
                  className="w-full py-3.5 rounded-xl bg-coral-600 hover:bg-coral-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    "Verifying Code..."
                  ) : (
                    <>
                      Verify Email <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <ResendTimer onResend={handleResend} disabled={loading || !!successMsg} />
                
                <div className="text-center">
                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Registration
                  </Link>
                </div>
              </div>

            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default VerifyEmail;

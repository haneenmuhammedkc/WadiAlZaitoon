import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { verifyResetOtp, resendOtp } from "../../services/authService";
import OtpInput from "../../components/auth/OtpInput";
import ResendTimer from "../../components/auth/ResendTimer";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const VerifyResetOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Route guard: Redirect to /forgot-password if email state is missing
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Email address is missing. Please start password recovery again.");
      return;
    }
    if (!otp || otp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);

      const res = await verifyResetOtp({ email, otp });

      if (res.success === false) {
        setError(res.message || "Invalid or expired verification code.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setSuccessMsg("Code verified successfully! Redirecting to create password...");

      setTimeout(() => {
        navigate("/reset-password", {
          replace: true,
          state: {
            email,
            resetToken: res.resetToken,
          },
        });
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to verify code.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email address is required to resend code.");
      return { success: false };
    }
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await resendOtp({ email, purpose: "PASSWORD_RESET" });

      if (res.success === false) {
        setError(res.message || "Failed to resend verification code.");
        return { success: false };
      }

      setSuccessMsg("A new verification code has been sent to your email.");
      return { success: true };
    } catch (err) {
      setError(err.message || "Failed to resend verification code.");
      return { success: false };
    }
  };

  if (!email) {
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
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-coral-600">
                  VERIFY YOUR EMAIL
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Enter Verification Code
                </h1>
                <p className="text-xs text-slate-500 font-normal">
                  We've sent a 6-digit verification code to:
                </p>
                <p className="text-xs font-extrabold text-slate-900 bg-slate-100 py-1.5 px-3 rounded-lg inline-block">
                  {email}
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
                      Verify Code <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <ResendTimer onResend={handleResend} disabled={loading || !!successMsg} />
                
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Forgot Password
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

export default VerifyResetOtp;

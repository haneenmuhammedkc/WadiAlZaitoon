import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { PageTransition, FadeIn } from "../../components/animations/Motion";

const PasswordResetSuccess = () => {
  return (
    <PageTransition>
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <FadeIn>
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6 text-center">
              
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-100 mb-2">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-600">
                PASSWORD UPDATED
              </span>
              
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Password Reset Successful!
              </h1>
              
              <p className="text-xs text-slate-500 font-normal leading-relaxed">
                Your password has been successfully reset. You can now sign in using your new password.
              </p>

              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  BACK TO SIGN IN <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
};

export default PasswordResetSuccess;

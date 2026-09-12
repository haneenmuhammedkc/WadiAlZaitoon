import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

const ResendTimer = ({ onResend, initialSeconds = 60, disabled = false }) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timer = null;
    if (seconds > 0) {
      timer = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [seconds]);

  const handleResendClick = async () => {
    if (seconds > 0 || loading || disabled) return;
    setLoading(true);
    try {
      const result = await onResend();
      if (result?.success !== false) {
        setSeconds(initialSeconds); // Reset cooldown to 60s on successful trigger
      }
    } catch (err) {
      // Error handled by parent handler
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center text-xs text-slate-500">
      {seconds > 0 ? (
        <span className="font-medium text-slate-400 flex items-center justify-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-400" />
          Resend code in <strong className="text-slate-700 font-bold">{seconds}s</strong>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResendClick}
          disabled={disabled || loading}
          className="font-bold text-coral-600 hover:text-coral-700 hover:underline inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Sending Code..." : "Resend Code"}
        </button>
      )}
    </div>
  );
};

export default ResendTimer;

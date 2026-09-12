import React, { useRef } from "react";

const OtpInput = ({ value = "", onChange, disabled = false, error = false, length = 6 }) => {
  const inputRefs = useRef([]);

  // Ensure value is formatted as length-6 string array
  const otpDigits = Array(length)
    .fill("")
    .map((_, i) => (value && value[i] ? value[i] : ""));

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Extract only digits
    const digits = val.replace(/\D/g, "");
    if (!digits) {
      // Cleared input
      const newOtp = [...otpDigits];
      newOtp[index] = "";
      onChange(newOtp.join(""));
      return;
    }

    if (digits.length === 1) {
      const newOtp = [...otpDigits];
      newOtp[index] = digits;
      onChange(newOtp.join(""));
      // Focus next input box if available
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    } else if (digits.length > 1) {
      // User typed or pasted multiple digits in a single box
      handlePasteData(digits);
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        // Backspace on empty input -> focus previous input
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasteData = (pastedText) => {
    const digits = pastedText.replace(/\D/g, "").slice(0, length);
    if (digits.length > 0) {
      onChange(digits);
      const nextFocusIndex = Math.min(digits.length, length - 1);
      if (inputRefs.current[nextFocusIndex]) {
        inputRefs.current[nextFocusIndex].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    handlePasteData(pastedText);
  };

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-3 my-4">
      {otpDigits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={handlePaste}
          aria-label={`Digit ${index + 1} of verification code`}
          className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all focus:outline-none ${
            error
              ? "border-red-400 bg-red-50/50 text-red-900 focus:border-red-500 focus:ring-2 focus:ring-red-200"
              : digit
              ? "border-coral-500 bg-slate-50 text-slate-900 shadow-sm"
              : "border-slate-200 bg-slate-50 text-slate-900 focus:border-coral-500 focus:bg-white focus:ring-2 focus:ring-coral-100"
          } ${disabled ? "opacity-50 cursor-not-allowed bg-slate-100" : ""}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;

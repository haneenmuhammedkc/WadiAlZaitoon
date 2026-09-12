import crypto from "crypto";
import bcryptjs from "bcryptjs";
import OTP from "../models/OTP.js";

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Generate a cryptographically secure 6-digit numeric OTP
 * @returns {string}
 */
export const generateNumericOTP = () => {
  // Generates integer in range [100000, 999999] using CSPRNG
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Create, hash, and store a new OTP record for a given email and purpose.
 * Enforces resend cooldown and invalidates prior active OTPs for the same purpose.
 *
 * @param {string} rawEmail
 * @param {"EMAIL_VERIFICATION"|"PASSWORD_RESET"} purpose
 * @returns {Promise<{ otp: string, expiresAt: Date }>} Plaintext OTP (for emailing) and expiration date
 */
export const createAndSaveOTP = async (rawEmail, purpose) => {
  const email = String(rawEmail).toLowerCase().trim();

  // 1. Check resend cooldown
  const recentOtp = await OTP.findOne({
    email,
    purpose,
    consumed: false,
  }).sort({ createdAt: -1 });

  if (recentOtp) {
    const elapsedSeconds = (Date.now() - new Date(recentOtp.createdAt).getTime()) / 1000;
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds);
      const error = new Error(`Please wait ${waitSeconds} second${waitSeconds > 1 ? "s" : ""} before requesting another code.`);
      error.statusCode = 429;
      throw error;
    }
  }

  // 2. Invalidate any prior active OTPs for the same email and purpose
  await OTP.updateMany(
    { email, purpose, consumed: false },
    { $set: { consumed: true } }
  );

  // 3. Generate cryptographically secure 6-digit OTP
  const otp = generateNumericOTP();

  // 4. Hash the OTP securely
  const otpHash = bcryptjs.hashSync(otp, 10);

  // 5. Calculate expiration date
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // 6. Save to database
  await OTP.create({
    email,
    purpose,
    otpHash,
    expiresAt,
    attempts: 0,
    consumed: false,
  });

  return { otp, expiresAt };
};

/**
 * Verify an input OTP against the active stored record for an email & purpose.
 *
 * @param {string} rawEmail
 * @param {"EMAIL_VERIFICATION"|"PASSWORD_RESET"} purpose
 * @param {string} inputOtp
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
export const verifyOTP = async (rawEmail, purpose, inputOtp) => {
  const email = String(rawEmail).toLowerCase().trim();
  const cleanInputOtp = String(inputOtp || "").trim();

  if (!cleanInputOtp || cleanInputOtp.length !== 6) {
    return {
      success: false,
      message: "Please enter a valid 6-digit verification code.",
    };
  }

  // Find active, unconsumed OTP
  const otpRecord = await OTP.findOne({
    email,
    purpose,
    consumed: false,
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return {
      success: false,
      message: "Invalid or expired verification code.",
    };
  }

  // Expiration check
  if (new Date() > new Date(otpRecord.expiresAt)) {
    otpRecord.consumed = true;
    await otpRecord.save();
    return {
      success: false,
      message: "Verification code has expired. Please request a new code.",
    };
  }

  // Max attempts check
  if (otpRecord.attempts >= MAX_ATTEMPTS) {
    otpRecord.consumed = true;
    await otpRecord.save();
    return {
      success: false,
      message: "Maximum verification attempts exceeded. Please request a new code.",
    };
  }

  // Compare hash
  const isMatch = bcryptjs.compareSync(cleanInputOtp, otpRecord.otpHash);

  if (!isMatch) {
    otpRecord.attempts += 1;
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      otpRecord.consumed = true;
    }
    await otpRecord.save();
    return {
      success: false,
      message: "Invalid verification code. Please check and try again.",
    };
  }

  // Successful verification -> mark single use
  otpRecord.consumed = true;
  await otpRecord.save();

  return { success: true };
};

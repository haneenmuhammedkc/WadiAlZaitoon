import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["EMAIL_VERIFICATION", "PASSWORD_RESET"],
    },
    otpHash: {
      type: String,
      required: true,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    consumed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Compound index for fast active OTP lookups by recipient & purpose
otpSchema.index({ email: 1, purpose: 1 });

// TTL index to automatically remove expired OTP records after 24 hours
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 86400 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;

import express from "express";
import {
  logOutController,
  loginController,
  signupController,
  verifyEmailController,
  resendOtpController,
  forgotPasswordController,
  verifyResetOtpController,
  resetPasswordController,
  test,
} from "../controllers/authController.js";

const router = express.Router();

// Test route
router.get("/test", test);

// Authentication routes
router.post("/signup", signupController);
router.post("/login", loginController);
router.get("/logout", logOutController);

// OTP & Verification routes
router.post("/verify-email", verifyEmailController);
router.post("/resend-otp", resendOtpController);
router.post("/forgot-password", forgotPasswordController);
router.post("/verify-reset-otp", verifyResetOtpController);
router.post("/reset-password", resetPasswordController);

export default router;

import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { createAndSaveOTP, verifyOTP } from "../services/otpService.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/emailService.js";

// Test controller
export const test = (req, res) => {
  return res.send("Hello From Test!");
};

// Signup controller
export const signupController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).send({
        success: false,
        message: "Please provide a valid email address!",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters long!",
      });
    }

    let userExists = await User.findOne({ email: normalizedEmail });

    // If existing user is fully verified, reject duplicate registration
    if (userExists && userExists.isEmailVerified === true) {
      return res.status(409).send({
        success: false,
        message: "User already exists please login",
      });
    }

    const normalizeSignupAddress = (raw) => {
      const empty = {
        streetAddress: "",
        apartment: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
        customField: { name: "", value: "" },
      };
      if (!raw) return empty;
      if (typeof raw === "object") {
        return {
          streetAddress: raw.streetAddress ? String(raw.streetAddress).trim() : "",
          apartment: raw.apartment ? String(raw.apartment).trim() : "",
          city: raw.city ? String(raw.city).trim() : "",
          state: raw.state ? String(raw.state).trim() : "",
          postalCode: raw.postalCode ? String(raw.postalCode).trim() : "",
          country: raw.country ? String(raw.country).trim() : "",
          customField: {
            name: raw.customField?.name ? String(raw.customField.name).trim().slice(0, 50) : "",
            value: raw.customField?.value ? String(raw.customField.value).trim().slice(0, 250) : "",
          },
        };
      }
      if (typeof raw === "string") {
        const trimmed = raw.trim();
        if (!trimmed || trimmed === "[object Object]") return empty;
        if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            return normalizeSignupAddress(JSON.parse(trimmed));
          } catch {
            return { ...empty, streetAddress: trimmed };
          }
        }
        return { ...empty, streetAddress: trimmed };
      }
      return empty;
    };

    const hashedPassword = bcryptjs.hashSync(password, 10);

    if (userExists && userExists.isEmailVerified === false) {
      // Re-initialize unverified user account
      userExists.username = String(username).trim();
      userExists.password = hashedPassword;
      userExists.address = normalizeSignupAddress(req.body.address);
      userExists.phone = req.body.phone ? String(req.body.phone).trim() : "";
      await userExists.save();
    } else {
      userExists = new User({
        username: String(username).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        address: normalizeSignupAddress(req.body.address),
        phone: req.body.phone ? String(req.body.phone).trim() : "",
        isEmailVerified: false,
      });
      await userExists.save();
    }

    // Generate & send verification OTP via Brevo
    const { otp } = await createAndSaveOTP(normalizedEmail, "EMAIL_VERIFICATION");
    await sendVerificationEmail(normalizedEmail, otp);

    return res.status(201).send({
      success: true,
      message: "Registration successful. Please verify your email with the OTP sent to your inbox.",
      email: normalizedEmail,
      isEmailVerified: false,
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).send({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Login controller
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const validUser = await User.findOne({ email: normalizedEmail });
    if (!validUser) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Block login if email is unverified
    if (validUser.isEmailVerified === false) {
      return res.status(403).send({
        success: false,
        message: "Email not verified. Please verify your email before logging in.",
        isEmailVerified: false,
        email: normalizedEmail,
      });
    }

    const token = await jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "4d",
      }
    );
    const { password: pass, ...rest } = validUser._doc;

    const cookieOptions = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 24 * 60 * 60 * 1000,
    };

    res
      .cookie("X_TTMS_access_token", token, cookieOptions)
      .status(200)
      .send({
        success: true,
        message: "Login Success",
        user: rest,
      });
  } catch (error) {
    next(error);
  }
};

// Logout controller
export const logOutController = (req, res, next) => {
  try {
    res.clearCookie("X_TTMS_access_token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).send({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Verify email controller
export const verifyEmailController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).send({
        success: false,
        message: "Email and OTP verification code are required!",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User account not found!",
      });
    }

    if (user.isEmailVerified === true) {
      return res.status(200).send({
        success: true,
        message: "Email is already verified. You can now log in.",
      });
    }

    const verificationResult = await verifyOTP(normalizedEmail, "EMAIL_VERIFICATION", otp);
    if (!verificationResult.success) {
      return res.status(400).send({
        success: false,
        message: verificationResult.message,
      });
    }

    user.isEmailVerified = true;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

// Resend OTP controller
export const resendOtpController = async (req, res, next) => {
  try {
    const { email, purpose = "EMAIL_VERIFICATION" } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email address is required!",
      });
    }

    const validPurposes = ["EMAIL_VERIFICATION", "PASSWORD_RESET"];
    const targetPurpose = validPurposes.includes(purpose) ? purpose : "EMAIL_VERIFICATION";
    const normalizedEmail = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    // Enumeration protection: safe generic response if user not found
    if (!user) {
      return res.status(200).send({
        success: true,
        message: "If an account exists for this email, a verification code has been sent.",
      });
    }

    if (targetPurpose === "EMAIL_VERIFICATION" && user.isEmailVerified === true) {
      return res.status(400).send({
        success: false,
        message: "Email is already verified.",
      });
    }

    const { otp } = await createAndSaveOTP(normalizedEmail, targetPurpose);

    if (targetPurpose === "EMAIL_VERIFICATION") {
      await sendVerificationEmail(normalizedEmail, otp);
    } else {
      await sendPasswordResetEmail(normalizedEmail, otp);
    }

    return res.status(200).send({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).send({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// Forgot password controller
export const forgotPasswordController = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email address is required!",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    const genericResponse = {
      success: true,
      message: "If an account exists for this email, a password reset code has been sent.",
    };

    if (!user) {
      return res.status(200).send(genericResponse);
    }

    try {
      const { otp } = await createAndSaveOTP(normalizedEmail, "PASSWORD_RESET");
      await sendPasswordResetEmail(normalizedEmail, otp);
    } catch (err) {
      if (err.statusCode === 429) {
        return res.status(429).send({
          success: false,
          message: err.message,
        });
      }
      throw err;
    }

    return res.status(200).send(genericResponse);
  } catch (error) {
    next(error);
  }
};

// Verify Reset OTP controller
export const verifyResetOtpController = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).send({
        success: false,
        message: "Email and OTP verification code are required!",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid email or verification code.",
      });
    }

    const verificationResult = await verifyOTP(normalizedEmail, "PASSWORD_RESET", otp);
    if (!verificationResult.success) {
      return res.status(400).send({
        success: false,
        message: verificationResult.message,
      });
    }

    // Sign a temporary reset token (valid for 15 minutes)
    const resetToken = jwt.sign(
      { email: normalizedEmail, purpose: "PASSWORD_RESET" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    return res.status(200).send({
      success: true,
      resetToken,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// Reset password controller
export const resetPasswordController = async (req, res, next) => {
  try {
    const { email, resetToken, otp, newPassword } = req.body;

    if (!email || !newPassword || (!resetToken && !otp)) {
      return res.status(400).send({
        success: false,
        message: "Email, reset authorization, and new password are required!",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).send({
        success: false,
        message: "New password must be at least 6 characters long!",
      });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).send({
        success: false,
        message: "Invalid request.",
      });
    }

    // 1. Verify via signed resetToken (Preferred multi-step flow)
    if (resetToken) {
      try {
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        if (decoded.email !== normalizedEmail || decoded.purpose !== "PASSWORD_RESET") {
          return res.status(400).send({
            success: false,
            message: "Invalid or expired password reset session.",
          });
        }
      } catch (err) {
        return res.status(400).send({
          success: false,
          message: "Password reset session expired or invalid. Please request a new verification code.",
        });
      }
    } else if (otp) {
      // 2. Legacy single-step OTP verification fallback
      const verificationResult = await verifyOTP(normalizedEmail, "PASSWORD_RESET", otp);
      if (!verificationResult.success) {
        return res.status(400).send({
          success: false,
          message: verificationResult.message,
        });
      }
    }

    const hashedPassword = bcryptjs.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).send({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

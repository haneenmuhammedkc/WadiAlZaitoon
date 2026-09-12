import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import travellerRoutes from "./routes/travellerRoutes.js";
import hotelRoutes from "./routes/hotelRoutes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.SERVER_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10kb",
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(cookieParser());

// Rate Limiter for Authentication Endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/api/auth/verify-email", authLimiter);
app.use("/api/auth/resend-otp", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api/auth/verify-reset-otp", authLimiter);
app.use("/api/auth/reset-password", authLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/package", packageRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/traveller", travellerRoutes);
app.use("/api/hotel", hotelRoutes);

// Centralized Express Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  const response = {
    success: false,
    message: err.message || "Internal server error",
  };

  if (!isProduction && err.stack) {
    response.stack = err.stack;
  }

  return res.status(statusCode).send(response);
});

export default app;
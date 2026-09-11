import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
  console.error("ERROR: JWT_SECRET environment variable is required.");
  process.exit(1);
}

import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";

import connectDB from "./config/database.js";

import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import ratingRoute from "./routes/rating.route.js";
import packageRoute from "./routes/package.route.js";
import bookingRoute from "./routes/booking.route.js";
import paymentRoute from "./routes/payment.route.js";
import travellerRoute from "./routes/traveller.route.js";
import hotelRoute from "./routes/hotel.route.js";

const app = express();

connectDB();

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

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/package", packageRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/traveller", travellerRoute);
app.use("/api/hotel", hotelRoute);

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

const Port = process.env.PORT || 6005;

app.listen(Port, () => {
  console.log(`Server is Listening at ${Port}`);
});

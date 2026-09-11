import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createRazorpayOrder,
  retryRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getAdminPaymentLedger,
  adminInitiateRefund,
} from "../controllers/payment.controller.js";

const router = express.Router();

// Create Pending Booking & Razorpay Order
router.post("/create-order", requireSignIn, createRazorpayOrder);

// Payment Retry for Existing Pending/Failed Booking
router.post("/retry-order/:bookingId", requireSignIn, retryRazorpayOrder);

// Verify Payment Callback & Confirm Booking
router.post("/verify-payment", requireSignIn, verifyRazorpayPayment);

// Asynchronous Razorpay Webhook Endpoint (Unauthenticated)
router.post("/webhook", handleRazorpayWebhook);

// Admin Payment Ledger & Revenue Reconciliation (Admin Restricted)
router.get("/admin/payment-ledger", requireSignIn, isAdmin, getAdminPaymentLedger);

// Admin Initiate Refund Endpoint (Admin Restricted)
router.post("/admin/refund", requireSignIn, isAdmin, adminInitiateRefund);

export default router;

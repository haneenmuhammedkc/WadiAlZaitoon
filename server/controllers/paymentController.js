import * as paymentService from "../services/paymentService.js";
import { executeRefundLogic } from "../services/refundService.js";

// Re-export executeRefundLogic from refundService for backward compatibility
export { executeRefundLogic };

// Create Pre-Payment Pending Booking & Razorpay Order
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { packageId, persons, date, selectedRoom, selectedAddOns, adults, children, infants, rooms, returnDate } = req.body;
    const buyerId = req.user._id;

    const result = await paymentService.createRazorpayOrder({
      buyerId,
      packageId,
      persons,
      date,
      selectedRoom,
      selectedAddOns,
      adults,
      children,
      infants,
      rooms,
      returnDate,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// Payment Retry for Existing Pending/Failed Booking
export const retryRazorpayOrder = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const buyerId = req.user._id;

    const result = await paymentService.retryRazorpayOrder({
      bookingId,
      buyerId,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// Server-Side HMAC SHA256 Verification & Atomic Booking Confirmation Callback
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const result = await paymentService.verifyRazorpayPayment({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// Asynchronous Razorpay Webhook Endpoint
export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    const rawBodyBuffer = req.rawBody || (typeof req.body === "string" ? Buffer.from(req.body) : Buffer.from(JSON.stringify(req.body)));
    const eventData = req.body;

    const result = await paymentService.handleRazorpayWebhook({
      signature,
      rawBodyBuffer,
      eventData,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin Payment Ledger & Revenue Reconciliation Controller
export const getAdminPaymentLedger = async (req, res, next) => {
  try {
    if (
      !req.user ||
      (req.user.user_role !== 1 && req.user.userType !== "admin" && !req.user.isAdmin)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const searchTerm = req.query.searchTerm || "";
    const statusFilter = req.query.status || "";

    const result = await paymentService.getAdminPaymentLedger({
      searchTerm,
      statusFilter,
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin Initiate Refund Controller (Server-Authoritative & Atomic)
export const adminInitiateRefund = async (req, res, next) => {
  try {
    if (
      !req.user ||
      (req.user.user_role !== 1 && req.user.userType !== "admin" && !req.user.isAdmin)
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }

    const { bookingId, amount, reason, idempotencyKey } = req.body;

    if (!bookingId || !amount || !idempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "Valid bookingId, refund amount, and idempotencyKey are required.",
      });
    }

    const trimmedIdempotencyKey = String(idempotencyKey).trim();
    if (!trimmedIdempotencyKey) {
      return res.status(400).json({
        success: false,
        message: "A non-empty idempotencyKey is required.",
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || !isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Refund amount must be a positive number.",
      });
    }

    const amountSubunits = Math.round(numericAmount * 100);
    if (!Number.isInteger(amountSubunits) || amountSubunits < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid refund amount in subunits.",
      });
    }

    const result = await paymentService.adminInitiateRefund({
      bookingId,
      amount: numericAmount,
      reason,
      idempotencyKey: trimmedIdempotencyKey,
      initiatedBy: req.user._id,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    attemptNumber: {
      type: Number,
      required: true,
      min: [1, "Attempt number must be at least 1"],
    },
    provider: {
      type: String,
      enum: ["Razorpay"],
      default: "Razorpay",
      required: true,
    },
    providerOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    providerPaymentId: {
      type: String,
      index: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be non-negative"],
    },
    amountSubunits: {
      type: Number,
      required: true,
      min: [0, "Amount in subunits must be non-negative"],
    },
    currency: {
      type: String,
      enum: ["INR"],
      default: "INR",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Captured", "Failed"],
      default: "Pending",
      index: true,
    },
    failureReason: {
      type: String,
    },
    capturedAt: {
      type: Date,
    },
    refundedAmount: {
      type: Number,
      required: true,
      min: [0, "Refunded amount must be non-negative"],
      default: 0,
    },
    refundStatus: {
      type: String,
      enum: ["Unrefunded", "Partially_Refunded", "Fully_Refunded"],
      default: "Unrefunded",
      index: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;

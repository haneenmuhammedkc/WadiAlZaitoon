import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    providerRefundId: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount must be non-negative"],
    },
    amountSubunits: {
      type: Number,
      required: true,
      min: [1, "Amount in subunits must be at least 1"],
    },
    currency: {
      type: String,
      required: true,
      enum: ["INR"],
      default: "INR",
    },
    status: {
      type: String,
      required: true,
      enum: ["Pending", "Processed", "Failed"],
      default: "Pending",
      index: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    isCancellation: {
      type: Boolean,
      default: false,
    },
    failureReason: {
      type: String,
      trim: true,
    },
    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Refund = mongoose.model("Refund", refundSchema);

export default Refund;

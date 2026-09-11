import Razorpay from "razorpay";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Refund from "../models/Refund.js";

/**
 * Reusable Server-Authoritative Refund Execution Service
 * Handles idempotency checks, atomic payment reservation, refund document lifecycle,
 * Razorpay refund API execution, and status rollback upon definitive failure.
 */
export const executeRefundLogic = async ({
  booking,
  payment,
  amount,
  reason,
  idempotencyKey,
  initiatedBy,
  isCancellation = false,
}) => {
  const numericAmount = Number(amount);
  const amountSubunits = Math.round(numericAmount * 100);

  // 1. Idempotency Check
  const existingRefund = await Refund.findOne({ idempotencyKey });
  if (existingRefund) {
    if (String(existingRefund.bookingId) !== String(booking._id) || Number(existingRefund.amount) !== numericAmount) {
      return { success: false, statusCode: 400, message: "Idempotency key reuse with mismatched parameters is rejected." };
    }

    if (existingRefund.status === "Processed") {
      return { success: true, statusCode: 200, message: "Refund already processed under this idempotency key.", refund: existingRefund };
    } else if (existingRefund.status === "Pending") {
      return { success: true, statusCode: 200, isPending: true, message: "Refund request is currently pending.", refund: existingRefund };
    } else if (existingRefund.status === "Failed") {
      return { success: false, statusCode: 409, message: "Previous refund under this idempotency key failed. A new idempotencyKey is required to retry.", refund: existingRefund };
    }
  }

  // 2. Refund Balance Check
  const currentRefunded = Number(payment.refundedAmount || 0);
  const originalAmount = Number(payment.amount);
  const refundableBalance = originalAmount - currentRefunded;

  if (numericAmount > refundableBalance) {
    return { success: false, statusCode: 400, message: `Requested refund amount ₹${numericAmount} exceeds maximum refundable balance ₹${refundableBalance}.` };
  }

  // 3. Atomic Reservation on Payment
  const updatedPayment = await Payment.findOneAndUpdate(
    {
      _id: payment._id,
      status: "Captured",
      refundedAmount: { $lte: originalAmount - numericAmount },
    },
    {
      $inc: { refundedAmount: numericAmount },
    },
    { new: true }
  );

  if (!updatedPayment) {
    return { success: false, statusCode: 409, message: "Concurrent refund lock failed or insufficient refundable balance." };
  }

  const newTotalRefunded = updatedPayment.refundedAmount;
  let newRefundStatus = "Partially_Refunded";
  if (newTotalRefunded >= originalAmount) {
    newRefundStatus = "Fully_Refunded";
  }
  await Payment.findByIdAndUpdate(payment._id, { $set: { refundStatus: newRefundStatus } });

  // 4. Create Refund Document (Pending)
  const newRefund = new Refund({
    bookingId: booking._id,
    paymentId: payment._id,
    userId: booking.buyer,
    initiatedBy: initiatedBy,
    amount: numericAmount,
    amountSubunits: amountSubunits,
    currency: "INR",
    status: "Pending",
    reason: reason ? String(reason).trim() : (isCancellation ? "Booking cancellation refund" : "Admin initiated refund"),
    idempotencyKey,
    isCancellation,
  });

  try {
    await newRefund.save();
  } catch (saveErr) {
    await Payment.findOneAndUpdate({ _id: payment._id }, { $inc: { refundedAmount: -numericAmount } });
    const rollbackPayment = await Payment.findById(payment._id);
    const rolledBackStatus = rollbackPayment.refundedAmount === 0 ? "Unrefunded" : rollbackPayment.refundedAmount >= originalAmount ? "Fully_Refunded" : "Partially_Refunded";
    await Payment.findByIdAndUpdate(payment._id, { $set: { refundStatus: rolledBackStatus } });

    return { success: false, statusCode: 500, message: "Failed to record refund document prior to execution." };
  }

  // 5. Execute Razorpay Refund API
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    await Payment.findOneAndUpdate({ _id: payment._id }, { $inc: { refundedAmount: -numericAmount } });
    newRefund.status = "Failed";
    newRefund.failureReason = "Razorpay API keys not configured";
    await newRefund.save();

    return { success: false, statusCode: 500, message: "Server configuration error: Razorpay API keys missing." };
  }

  const razorpay = new Razorpay({ key_id, key_secret });

  try {
    const razorpayRefund = await razorpay.payments.refund(payment.providerPaymentId, {
      amount: amountSubunits,
      notes: {
        bookingId: String(booking._id),
        refundId: String(newRefund._id),
      },
      receipt: idempotencyKey,
    });

    newRefund.status = "Processed";
    newRefund.providerRefundId = razorpayRefund.id;
    newRefund.processedAt = new Date();
    await newRefund.save();

    return { success: true, statusCode: 200, message: "Refund processed successfully.", refund: newRefund };
  } catch (rzpError) {
    const errorMessage = rzpError?.error?.description || rzpError?.message || "Razorpay API error";
    const isDefinitiveError =
      rzpError?.statusCode === 400 ||
      rzpError?.statusCode === 404 ||
      rzpError?.statusCode === 422 ||
      (rzpError?.error?.code && rzpError?.error?.code !== "GATEWAY_ERROR");

    if (isDefinitiveError) {
      newRefund.status = "Failed";
      newRefund.failureReason = errorMessage;
      await newRefund.save();

      await Payment.findOneAndUpdate({ _id: payment._id }, { $inc: { refundedAmount: -numericAmount } });
      const rolledBackPayment = await Payment.findById(payment._id);
      const rolledBackStatus = rolledBackPayment.refundedAmount === 0 ? "Unrefunded" : rolledBackPayment.refundedAmount >= originalAmount ? "Fully_Refunded" : "Partially_Refunded";
      await Payment.findByIdAndUpdate(payment._id, { $set: { refundStatus: rolledBackStatus } });

      return { success: false, statusCode: 400, message: `Razorpay refund failed: ${errorMessage}`, refund: newRefund };
    } else {
      return { success: true, statusCode: 202, isPending: true, message: "Refund request initiated; status pending confirmation from Razorpay.", refund: newRefund };
    }
  }
};

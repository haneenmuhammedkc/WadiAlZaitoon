import Booking from "../models/Booking.js";
import Package from "../models/Package.js";
import Payment from "../models/Payment.js";
import Traveller from "../models/Traveller.js";
import { executeRefundLogic } from "./refundService.js";
import mongoose from "mongoose";
import { escapeRegex, isValidObjectId } from "../utils/security.js";
import { generateBookingInvoicePDF } from "../utils/invoiceGenerator.js";

/**
 * Booking Domain Service
 * Handles booking creation, user/admin booking retrieval, booking history deletion,
 * booking cancellation workflows (with refund service integration), and invoice PDF generation.
 */

/**
 * 1. Legacy Direct Booking Service (Admin Restricted)
 */
export const bookPackage = async ({ user, packageDetails, packageIdParam, totalPrice, persons, date }) => {
  if (!user || (user.userType !== "admin" && !user.isAdmin)) {
    return {
      success: false,
      statusCode: 403,
      message: "Direct unpaid booking is disabled. All tour bookings must be completed through Razorpay checkout.",
    };
  }

  const targetPackageId = packageDetails || packageIdParam;

  if (!isValidObjectId(targetPackageId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid package ID format!",
    };
  }

  if (!targetPackageId || !totalPrice || !persons || !date) {
    return {
      success: false,
      statusCode: 400,
      message: "All fields are required!",
    };
  }

  const validPackage = await Package.findById(targetPackageId);
  if (!validPackage) {
    return {
      success: false,
      statusCode: 404,
      message: "Package Not Found!",
    };
  }

  const priceNum = Number(totalPrice);
  const personsNum = Number(persons);

  if (isNaN(priceNum) || priceNum <= 0 || isNaN(personsNum) || personsNum <= 0) {
    return {
      success: false,
      statusCode: 400,
      message: "Total price and persons must be valid numbers greater than 0!",
    };
  }

  const newBooking = await Booking.create({
    packageDetails: targetPackageId,
    buyer: user._id,
    totalPrice: priceNum,
    persons: personsNum,
    date: String(date),
    status: "Booked",
    paymentStatus: "Captured",
  });

  if (newBooking) {
    return {
      success: true,
      statusCode: 201,
      message: "Package Booked!",
    };
  } else {
    return {
      success: false,
      statusCode: 500,
      message: "Something went wrong!",
    };
  }
};

/**
 * 2. Get Current Active Bookings (Admin)
 */
export const getCurrentBookings = async ({ searchTerm = "" }) => {
  const safeSearch = escapeRegex(String(searchTerm));

  const bookings = await Booking.find({
    date: { $gt: new Date().toISOString() },
    status: { $in: ["Confirmed", "Approved", "Booked"] },
  })
    .populate("packageDetails")
    .populate({
      path: "buyer",
      match: {
        $or: [
          { username: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } },
        ],
      },
    })
    .sort({ createdAt: "asc" });

  const filteredBookings = bookings.filter((booking) => booking.buyer !== null);

  return {
    success: true,
    statusCode: 200,
    bookings: filteredBookings,
  };
};

/**
 * 3. Get All Bookings (Admin)
 */
export const getAllBookings = async ({ searchTerm = "" }) => {
  const safeSearch = escapeRegex(String(searchTerm));

  const bookings = await Booking.find({})
    .populate("packageDetails")
    .populate({
      path: "buyer",
      match: {
        $or: [
          { username: { $regex: safeSearch, $options: "i" } },
          { email: { $regex: safeSearch, $options: "i" } },
        ],
      },
    })
    .sort({ createdAt: "asc" });

  const filteredBookings = bookings.filter((booking) => booking.buyer !== null);

  return {
    success: true,
    statusCode: 200,
    bookings: filteredBookings,
  };
};

/**
 * 4. Get Current Active Bookings for User
 */
export const getUserCurrentBookings = async ({ userId, requestingUser, searchTerm = "" }) => {
  if (!isValidObjectId(userId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid user ID format!",
    };
  }

  if (String(requestingUser._id) !== String(userId)) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only get your own bookings!",
    };
  }

  const safeSearch = escapeRegex(String(searchTerm));

  const bookings = await Booking.find({
    buyer: new mongoose.Types.ObjectId(userId),
    date: { $gt: new Date().toISOString() },
    status: { $in: ["Confirmed", "Approved", "Booked", "Pending"] },
  })
    .populate({
      path: "packageDetails",
      match: {
        packageName: { $regex: safeSearch, $options: "i" },
      },
    })
    .populate("buyer", "username email")
    .sort({ createdAt: "asc" });

  const filteredBookings = bookings.filter((booking) => booking.packageDetails !== null);

  return {
    success: true,
    statusCode: 200,
    bookings: filteredBookings,
  };
};

/**
 * 5. Get All Bookings for User
 */
export const getAllUserBookings = async ({ userId, requestingUser, searchTerm = "" }) => {
  if (!isValidObjectId(userId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid user ID format!",
    };
  }

  if (String(requestingUser._id) !== String(userId)) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only get your own bookings!",
    };
  }

  const safeSearch = escapeRegex(String(searchTerm));

  const bookings = await Booking.find({
    buyer: new mongoose.Types.ObjectId(userId),
  })
    .populate({
      path: "packageDetails",
      match: {
        packageName: { $regex: safeSearch, $options: "i" },
      },
    })
    .populate("buyer", "username email")
    .sort({ createdAt: "asc" });

  const filteredBookings = bookings.filter((booking) => booking.packageDetails !== null);

  return {
    success: true,
    statusCode: 200,
    bookings: filteredBookings,
  };
};

/**
 * 6. Delete Booking History
 */
export const deleteBookingHistory = async ({ bookingId, userId, requestingUser }) => {
  if (!isValidObjectId(bookingId) || !isValidObjectId(userId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid ID format!",
    };
  }

  if (String(requestingUser._id) !== String(userId)) {
    return {
      success: false,
      statusCode: 403,
      message: "You can only delete your own booking history!",
    };
  }

  const targetBooking = await Booking.findById(bookingId);
  if (!targetBooking) {
    return {
      success: false,
      statusCode: 404,
      message: "Booking not found!",
    };
  }

  if (String(targetBooking.buyer) !== String(requestingUser._id)) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not authorized to delete this booking!",
    };
  }

  await Booking.findByIdAndDelete(bookingId);

  return {
    success: true,
    statusCode: 200,
    message: "Booking History Deleted!",
  };
};

/**
 * 7. Cancel Booking (Hardened & Integrated with Refund Architecture)
 */
export const cancelBooking = async ({ bookingId, user }) => {
  if (!isValidObjectId(bookingId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid booking ID format!",
    };
  }

  const targetBooking = await Booking.findById(bookingId);
  if (!targetBooking) {
    return {
      success: false,
      statusCode: 404,
      message: "Booking not found!",
    };
  }

  const callerId = user?._id;
  const isAdminCaller =
    user && (user.user_role === 1 || user.userType === "admin" || user.isAdmin);
  const isBuyerCaller = String(targetBooking.buyer) === String(callerId);

  if (!isAdminCaller && !isBuyerCaller) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not authorized to cancel this booking!",
    };
  }

  // Check if already cancelled
  if (targetBooking.status === "Cancelled") {
    return {
      success: true,
      statusCode: 200,
      message: "Booking is already cancelled.",
      booking: targetBooking,
    };
  }

  // Case 1: Unpaid or Failed payment booking -> Direct cancellation (no refund call)
  if (
    targetBooking.paymentStatus === "Pending" ||
    targetBooking.paymentStatus === "Failed" ||
    targetBooking.paymentStatus === "Processing"
  ) {
    targetBooking.status = "Cancelled";
    await targetBooking.save();

    return {
      success: true,
      statusCode: 200,
      message: "Booking cancelled successfully.",
      booking: targetBooking,
    };
  }

  // Case 2: Captured Payment booking -> Financial refund integration required
  if (targetBooking.paymentStatus === "Captured") {
    let capturedPayment = null;
    if (targetBooking.activePaymentId) {
      capturedPayment = await Payment.findOne({
        _id: targetBooking.activePaymentId,
        bookingId: targetBooking._id,
        status: "Captured",
        currency: "INR",
        provider: "Razorpay",
      });
    }
    if (!capturedPayment) {
      capturedPayment = await Payment.findOne({
        bookingId: targetBooking._id,
        status: "Captured",
        currency: "INR",
        provider: "Razorpay",
      });
    }

    if (!capturedPayment || !capturedPayment.providerPaymentId) {
      return {
        success: false,
        statusCode: 400,
        message: "Captured payment record not found or inconsistent.",
      };
    }

    const currentRefunded = Number(capturedPayment.refundedAmount || 0);
    const originalAmount = Number(capturedPayment.amount);
    const refundableBalance = originalAmount - currentRefunded;

    targetBooking.status = "Cancellation_Requested";
    await targetBooking.save();

    if (refundableBalance <= 0) {
      targetBooking.status = "Cancelled";
      await targetBooking.save();

      return {
        success: true,
        statusCode: 200,
        message: "Booking cancelled. Captured payment is already fully refunded.",
        booking: targetBooking,
      };
    }

    const idempotencyKey = `cancel_ref_${targetBooking._id}_${capturedPayment._id}_${refundableBalance}`;

    const refundResult = await executeRefundLogic({
      booking: targetBooking,
      payment: capturedPayment,
      amount: refundableBalance,
      reason: isBuyerCaller ? "User booking cancellation refund" : "Admin booking cancellation refund",
      idempotencyKey,
      initiatedBy: callerId,
      isCancellation: true,
    });

    if (refundResult.success && refundResult.refund?.status === "Processed") {
      targetBooking.status = "Cancelled";
      await targetBooking.save();

      return {
        success: true,
        statusCode: 200,
        message: "Booking cancelled and refund processed successfully.",
        booking: targetBooking,
        refund: refundResult.refund,
      };
    } else if (refundResult.refund?.status === "Pending" || refundResult.isPending) {
      return {
        success: true,
        statusCode: 200,
        message: "Booking cancellation requested; refund is pending processing.",
        booking: targetBooking,
        refund: refundResult.refund,
      };
    } else {
      return {
        success: false,
        statusCode: 400,
        message: `Cancellation requested, but gateway refund failed: ${refundResult.message || "Gateway error"}`,
        booking: targetBooking,
        refund: refundResult.refund,
      };
    }
  }

  targetBooking.status = "Cancelled";
  await targetBooking.save();

  return {
    success: true,
    statusCode: 200,
    message: "Booking cancelled.",
    booking: targetBooking,
  };
};

/**
 * 8. Download Booking PDF Invoice Service
 */
export const downloadBookingInvoice = async ({ bookingId, user }) => {
  if (!isValidObjectId(bookingId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid booking ID format!",
    };
  }

  const booking = await Booking.findById(bookingId)
    .populate("packageDetails")
    .populate("buyer", "username email phone");

  if (!booking) {
    return {
      success: false,
      statusCode: 404,
      message: "Booking not found!",
    };
  }

  const callerId = user?._id;
  const isAdminCaller =
    user && (user.user_role === 1 || user.userType === "admin" || user.isAdmin);
  const isBuyerCaller = String(booking.buyer?._id || booking.buyer) === String(callerId);

  if (!isAdminCaller && !isBuyerCaller) {
    return {
      success: false,
      statusCode: 403,
      message: "Access denied. You can only download invoices for your own bookings.",
    };
  }

  const isEligiblePayment = booking.paymentStatus === "Captured";
  const isEligibleStatus = ["Confirmed", "Approved", "Booked"].includes(booking.status);

  if (!isEligiblePayment || !isEligibleStatus) {
    return {
      success: false,
      statusCode: 400,
      message: "Invoice download is only available for confirmed and paid bookings.",
    };
  }

  let payment = null;
  if (booking.activePaymentId) {
    payment = await Payment.findById(booking.activePaymentId);
  }
  if (!payment) {
    payment = await Payment.findOne({ bookingId: booking._id, status: "Captured" });
  }

  const travellers = await Traveller.find({ bookingId: booking._id }).sort({ passengerNumber: 1 });

  const pdfBuffer = await generateBookingInvoicePDF({
    booking,
    payment,
    travellers,
  });

  const bookingIdStr = String(booking._id);
  const createdYear = booking.createdAt ? new Date(booking.createdAt).getFullYear() : new Date().getFullYear();
  const invoiceSuffix = bookingIdStr.slice(-6).toUpperCase();
  const filename = `INV-${createdYear}-${invoiceSuffix}.pdf`;

  return {
    success: true,
    statusCode: 200,
    pdfBuffer,
    filename,
  };
};

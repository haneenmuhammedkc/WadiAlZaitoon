import Booking from "../models/booking.model.js";
import Package from "../models/package.model.js";
import Payment from "../models/payment.model.js";
import Traveller from "../models/traveller.model.js";
import { executeRefundLogic } from "./payment.controller.js";
import mongoose from "mongoose";
import { escapeRegex, isValidObjectId } from "../utils/security.js";
import { generateBookingInvoicePDF } from "../utils/invoiceGenerator.js";

//book package (Legacy route - restricted to admin/disabled for direct user unpaid bookings)
export const bookPackage = async (req, res, next) => {
  try {
    if (!req.user || (req.user.userType !== "admin" && !req.user.isAdmin)) {
      return res.status(403).send({
        success: false,
        message: "Direct unpaid booking is disabled. All tour bookings must be completed through Razorpay checkout.",
      });
    }

    const { packageDetails, totalPrice, persons, date } = req.body;
    const packageIdParam = req.params.packageId;

    const targetPackageId = packageDetails || packageIdParam;

    if (!isValidObjectId(targetPackageId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid package ID format!",
      });
    }

    if (!targetPackageId || !totalPrice || !persons || !date) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const validPackage = await Package.findById(targetPackageId);
    if (!validPackage) {
      return res.status(404).send({
        success: false,
        message: "Package Not Found!",
      });
    }

    const priceNum = Number(totalPrice);
    const personsNum = Number(persons);

    if (isNaN(priceNum) || priceNum <= 0 || isNaN(personsNum) || personsNum <= 0) {
      return res.status(400).send({
        success: false,
        message: "Total price and persons must be valid numbers greater than 0!",
      });
    }

    const newBooking = await Booking.create({
      packageDetails: targetPackageId,
      buyer: req.user._id,
      totalPrice: priceNum,
      persons: personsNum,
      date: String(date),
      status: "Booked",
      paymentStatus: "Captured",
    });

    if (newBooking) {
      return res.status(201).send({
        success: true,
        message: "Package Booked!",
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Something went wrong!",
      });
    }
  } catch (error) {
    next(error);
  }
};

//get current bookings for admin
export const getCurrentBookings = async (req, res, next) => {
  try {
    const rawSearch = req.query.searchTerm || "";
    const safeSearch = escapeRegex(String(rawSearch));

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

    return res.status(200).send({
      success: true,
      bookings: filteredBookings,
    });
  } catch (error) {
    next(error);
  }
};

//get all bookings admin
export const getAllBookings = async (req, res, next) => {
  try {
    const rawSearch = req.query.searchTerm || "";
    const safeSearch = escapeRegex(String(rawSearch));

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

    return res.status(200).send({
      success: true,
      bookings: filteredBookings,
    });
  } catch (error) {
    next(error);
  }
};

//get current bookings for user by id
export const getUserCurrentBookings = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format!",
      });
    }

    if (String(req.user._id) !== String(req.params.id)) {
      return res.status(403).send({
        success: false,
        message: "You can only get your own bookings!",
      });
    }

    const rawSearch = req.query.searchTerm || "";
    const safeSearch = escapeRegex(String(rawSearch));

    const bookings = await Booking.find({
      buyer: new mongoose.Types.ObjectId(req.params.id),
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

    return res.status(200).send({
      success: true,
      bookings: filteredBookings,
    });
  } catch (error) {
    next(error);
  }
};

//get all bookings by user id
export const getAllUserBookings = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format!",
      });
    }

    if (String(req.user._id) !== String(req.params.id)) {
      return res.status(403).send({
        success: false,
        message: "You can only get your own bookings!",
      });
    }

    const rawSearch = req.query.searchTerm || "";
    const safeSearch = escapeRegex(String(rawSearch));

    const bookings = await Booking.find({
      buyer: new mongoose.Types.ObjectId(req.params.id),
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

    return res.status(200).send({
      success: true,
      bookings: filteredBookings,
    });
  } catch (error) {
    next(error);
  }
};

//delete booking history
export const deleteBookingHistory = async (req, res, next) => {
  try {
    const { id, userId } = req.params;

    if (!isValidObjectId(id) || !isValidObjectId(userId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format!",
      });
    }

    if (String(req.user._id) !== String(userId)) {
      return res.status(403).send({
        success: false,
        message: "You can only delete your own booking history!",
      });
    }

    const targetBooking = await Booking.findById(id);
    if (!targetBooking) {
      return res.status(404).send({
        success: false,
        message: "Booking not found!",
      });
    }

    if (String(targetBooking.buyer) !== String(req.user._id)) {
      return res.status(403).send({
        success: false,
        message: "You are not authorized to delete this booking!",
      });
    }

    await Booking.findByIdAndDelete(id);

    return res.status(200).send({
      success: true,
      message: "Booking History Deleted!",
    });
  } catch (error) {
    next(error);
  }
};

// cancel booking (Hardened & Integrated with Refund Architecture)
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const callerId = req.user?._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format!",
      });
    }

    const targetBooking = await Booking.findById(id);
    if (!targetBooking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    const isAdminCaller =
      req.user &&
      (req.user.user_role === 1 || req.user.userType === "admin" || req.user.isAdmin);
    const isBuyerCaller = String(targetBooking.buyer) === String(callerId);

    if (!isAdminCaller && !isBuyerCaller) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this booking!",
      });
    }

    // Check if already cancelled
    if (targetBooking.status === "Cancelled") {
      return res.status(200).json({
        success: true,
        message: "Booking is already cancelled.",
        booking: targetBooking,
      });
    }

    // Case 1: Unpaid or Failed payment booking -> Direct cancellation (no refund call)
    if (
      targetBooking.paymentStatus === "Pending" ||
      targetBooking.paymentStatus === "Failed" ||
      targetBooking.paymentStatus === "Processing"
    ) {
      targetBooking.status = "Cancelled";
      await targetBooking.save();

      return res.status(200).json({
        success: true,
        message: "Booking cancelled successfully.",
        booking: targetBooking,
      });
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
        return res.status(400).json({
          success: false,
          message: "Captured payment record not found or inconsistent.",
        });
      }

      const currentRefunded = Number(capturedPayment.refundedAmount || 0);
      const originalAmount = Number(capturedPayment.amount);
      const refundableBalance = originalAmount - currentRefunded;

      targetBooking.status = "Cancellation_Requested";
      await targetBooking.save();

      if (refundableBalance <= 0) {
        targetBooking.status = "Cancelled";
        await targetBooking.save();

        return res.status(200).json({
          success: true,
          message: "Booking cancelled. Captured payment is already fully refunded.",
          booking: targetBooking,
        });
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

        return res.status(200).json({
          success: true,
          message: "Booking cancelled and refund processed successfully.",
          booking: targetBooking,
          refund: refundResult.refund,
        });
      } else if (refundResult.refund?.status === "Pending" || refundResult.isPending) {
        return res.status(200).json({
          success: true,
          message: "Booking cancellation requested; refund is pending processing.",
          booking: targetBooking,
          refund: refundResult.refund,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: `Cancellation requested, but gateway refund failed: ${refundResult.message || "Gateway error"}`,
          booking: targetBooking,
          refund: refundResult.refund,
        });
      }
    }

    targetBooking.status = "Cancelled";
    await targetBooking.save();

    return res.status(200).json({
      success: true,
      message: "Booking cancelled.",
      booking: targetBooking,
    });
  } catch (error) {
    next(error);
  }
};

// Download Booking PDF Invoice
export const downloadBookingInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const callerId = req.user?._id;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format!",
      });
    }

    const booking = await Booking.findById(id)
      .populate("packageDetails")
      .populate("buyer", "username email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    // IDOR Protection: Must be the buyer or an Admin user
    const isAdminCaller =
      req.user &&
      (req.user.user_role === 1 || req.user.userType === "admin" || req.user.isAdmin);
    const isBuyerCaller = String(booking.buyer?._id || booking.buyer) === String(callerId);

    if (!isAdminCaller && !isBuyerCaller) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only download invoices for your own bookings.",
      });
    }

    // Payment & Status Eligibility: Only generate for captured/confirmed bookings
    const isEligiblePayment = booking.paymentStatus === "Captured";
    const isEligibleStatus = ["Confirmed", "Approved", "Booked"].includes(booking.status);

    if (!isEligiblePayment || !isEligibleStatus) {
      return res.status(400).json({
        success: false,
        message: "Invoice download is only available for confirmed and paid bookings.",
      });
    }

    // Retrieve active payment details if available
    let payment = null;
    if (booking.activePaymentId) {
      payment = await Payment.findById(booking.activePaymentId);
    }
    if (!payment) {
      payment = await Payment.findOne({ bookingId: booking._id, status: "Captured" });
    }

    // Retrieve registered travellers
    const travellers = await Traveller.find({ bookingId: booking._id }).sort({ passengerNumber: 1 });

    // Generate PDF Buffer using PDFKit
    const pdfBuffer = await generateBookingInvoicePDF({
      booking,
      payment,
      travellers,
    });

    const bookingIdStr = String(booking._id);
    const createdYear = booking.createdAt ? new Date(booking.createdAt).getFullYear() : new Date().getFullYear();
    const invoiceSuffix = bookingIdStr.slice(-6).toUpperCase();
    const filename = `INV-${createdYear}-${invoiceSuffix}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    return res.end(pdfBuffer);
  } catch (error) {
    next(error);
  }
};


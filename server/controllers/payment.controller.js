import Razorpay from "razorpay";
import crypto from "crypto";
import Package from "../models/package.model.js";
import Booking from "../models/booking.model.js";
import Payment from "../models/payment.model.js";
import Refund from "../models/refund.model.js";
import { escapeRegex } from "../utils/security.js";

// Create Pre-Payment Pending Booking & Razorpay Order
export const createRazorpayOrder = async (req, res, next) => {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Razorpay API keys are not configured.",
      });
    }

    const { packageId, persons, date, selectedRoom, selectedAddOns, adults, children, infants, rooms, returnDate } = req.body;
    const buyerId = req.user._id;

    const guestCount = Number(persons) || Math.max(1, (Number(adults) || 1) + (Number(children) || 0));

    if (!packageId || !guestCount || guestCount < 1 || !date) {
      return res.status(400).json({
        success: false,
        message: "Valid package ID, departure date, and number of travelers are required.",
      });
    }

    const packageData = await Package.findById(packageId).populate("hotel");
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: "Package not found.",
      });
    }

    // Server-authoritative price calculation & lookup dictionaries
    const SERVER_ROOM_TYPES = {
      "deluxe-sea-view": { priceMultiplier: 1.0, name: "Deluxe Sea View Room" },
      "executive-suite": { priceMultiplier: 1.25, name: "Executive Luxury Suite" },
      "family-suite": { priceMultiplier: 1.4, name: "Two-Bedroom Family Suite" },
    };

    const SERVER_ADDONS = {
      "addon-transfer": { id: "addon-transfer", price: 2499, type: "per_booking", title: "Airport Transfer (Roundtrip)" },
      "addon-insurance": { id: "addon-insurance", price: 1299, type: "per_person", title: "Comprehensive Travel Insurance" },
      "addon-city-tour": { id: "addon-city-tour", price: 3999, type: "per_person", title: "Private City Sightseeing Tour" },
      "addon-cultural-night": { id: "addon-cultural-night", price: 1899, type: "per_person", title: "VIP Cultural Dinner & Show" },
    };

    const unitPrice =
      packageData.packageOffer && packageData.packageDiscountPrice > 0
        ? packageData.packageDiscountPrice
        : packageData.packagePrice;

    const baseTotal = unitPrice * guestCount;
    const roomKey = selectedRoom?.id || "deluxe-sea-view";
    const validatedRoom = SERVER_ROOM_TYPES[roomKey] || SERVER_ROOM_TYPES["deluxe-sea-view"];
    const roomMultiplier = validatedRoom.priceMultiplier;
    const roomTotal = Math.round(baseTotal * roomMultiplier);

    const validatedAddOns = [];
    let addOnsTotal = 0;
    if (Array.isArray(selectedAddOns)) {
      for (const clientAddon of selectedAddOns) {
        const serverAddon = SERVER_ADDONS[clientAddon?.id];
        if (serverAddon) {
          validatedAddOns.push(serverAddon);
          if (serverAddon.type === "per_person") {
            addOnsTotal += serverAddon.price * guestCount;
          } else {
            addOnsTotal += serverAddon.price;
          }
        }
      }
    }

    const calculatedTotalPrice = roomTotal + addOnsTotal;
    const amountInSubunits = Math.round(calculatedTotalPrice * 100);

    // Capture historical hotel snapshot if package has assigned hotel
    const hotelSnapshot = packageData.hotel
      ? {
          hotelId: packageData.hotel._id,
          hotelName: packageData.hotel.hotelName,
          location: packageData.hotel.location,
          destination: packageData.hotel.destination,
          roomType: validatedRoom?.name || packageData.hotel.roomType,
          mealPlan: packageData.hotel.mealPlan,
          rating: packageData.hotel.rating,
        }
      : null;

    // 1. Create Pending Booking in Database BEFORE Razorpay order creation
    const newBooking = new Booking({
      packageDetails: packageData._id,
      buyer: buyerId,
      totalPrice: calculatedTotalPrice,
      persons: guestCount,
      date: String(date),
      returnDate: returnDate ? String(returnDate) : "",
      adults: Number(adults) || 1,
      children: Number(children) || 0,
      infants: Number(infants) || 0,
      rooms: Number(rooms) || 1,
      selectedRoom: validatedRoom,
      selectedAddOns: validatedAddOns,
      status: "Pending",
      paymentStatus: "Pending",
      paymentMethod: "Razorpay",
      hotelSnapshot,
    });

    await newBooking.save();

    // 2. Create Razorpay Order via SDK
    let order;
    try {
      const razorpayInstance = new Razorpay({ key_id, key_secret });
      const options = {
        amount: amountInSubunits,
        currency: "INR",
        receipt: `receipt_${newBooking._id}_${Date.now()}`,
        notes: {
          bookingId: newBooking._id.toString(),
          userId: buyerId.toString(),
        },
      };

      order = await razorpayInstance.orders.create(options);
    } catch (err) {
      // Rollback Safety: Remove orphaned Pending Booking if Razorpay order creation fails
      await Booking.findByIdAndDelete(newBooking._id);
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order with gateway provider.",
      });
    }

    // 3. Create Payment Attempt Record (Attempt #1)
    let newPayment;
    try {
      newPayment = new Payment({
        bookingId: newBooking._id,
        userId: buyerId,
        attemptNumber: 1,
        provider: "Razorpay",
        providerOrderId: order.id,
        amount: calculatedTotalPrice,
        amountSubunits: amountInSubunits,
        currency: "INR",
        status: "Pending",
      });
      await newPayment.save();
    } catch (payErr) {
      await Booking.findByIdAndDelete(newBooking._id);
      return res.status(500).json({
        success: false,
        message: "Failed to create payment attempt record.",
      });
    }

    // 4. Attach razorpayOrderId and activePaymentId to the Pending Booking
    newBooking.razorpayOrderId = order.id;
    newBooking.activePaymentId = newPayment._id;
    await newBooking.save();

    return res.status(200).json({
      success: true,
      bookingId: newBooking._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
    });
  } catch (error) {
    next(error);
  }
};

// Payment Retry for Existing Pending/Failed Booking (NEVER CREATES A NEW BOOKING)
export const retryRazorpayOrder = async (req, res, next) => {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Razorpay API keys are not configured.",
      });
    }

    const { bookingId } = req.params;
    const buyerId = req.user._id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required.",
      });
    }

    // 1. Fetch Booking and verify ownership
    const booking = await Booking.findById(bookingId);
    if (!booking || String(booking.buyer) !== String(buyerId)) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or access denied.",
      });
    }

    // 2. Explicit Allow-List Eligibility & Concurrency Check
    if (booking.paymentStatus === "Processing") {
      return res.status(409).json({
        success: false,
        message: "A retry attempt or payment processing is already in progress for this booking.",
      });
    }

    const isEligible =
      booking.status === "Pending" &&
      (booking.paymentStatus === "Pending" || booking.paymentStatus === "Failed");

    if (!isEligible) {
      return res.status(400).json({
        success: false,
        message: "This booking is not eligible for payment retry.",
      });
    }

    const previousPaymentStatus = booking.paymentStatus;
    const previousRazorpayOrderId = booking.razorpayOrderId;
    const previousBookingStatus = booking.status;

    // 3. Server-side Concurrency Guard: Atomic update to "Processing" lock state
    const lockedBooking = await Booking.findOneAndUpdate(
      {
        _id: bookingId,
        buyer: buyerId,
        status: "Pending",
        paymentStatus: { $in: ["Pending", "Failed"] },
      },
      {
        $set: { paymentStatus: "Processing" },
      },
      { new: true }
    );

    if (!lockedBooking) {
      return res.status(409).json({
        success: false,
        message: "A retry attempt or payment processing is already in progress for this booking.",
      });
    }

    // Calculate next attempt number safely
    const existingAttemptsCount = await Payment.countDocuments({ bookingId: lockedBooking._id });
    const nextAttemptNumber = existingAttemptsCount + 1;

    // 4. Server-authoritative amount derived strictly from original locked Booking.totalPrice
    const amountInSubunits = Math.round(Number(lockedBooking.totalPrice) * 100);

    // 5. Create NEW Razorpay Order via SDK
    let order;
    try {
      const razorpayInstance = new Razorpay({ key_id, key_secret });
      const options = {
        amount: amountInSubunits,
        currency: "INR",
        receipt: `retry_${lockedBooking._id}_${Date.now()}`,
        notes: {
          bookingId: lockedBooking._id.toString(),
          userId: buyerId.toString(),
        },
      };

      order = await razorpayInstance.orders.create(options);
    } catch (err) {
      // ROLLBACK SAFETY: Revert paymentStatus to previous state if order creation fails
      try {
        lockedBooking.paymentStatus = previousPaymentStatus;
        if (previousRazorpayOrderId) lockedBooking.razorpayOrderId = previousRazorpayOrderId;
        lockedBooking.status = previousBookingStatus;
        await lockedBooking.save();
      } catch (rollbackErr) {
        console.error("Failed to restore booking state after order creation failure:", rollbackErr);
      }
      return res.status(500).json({
        success: false,
        message: "Failed to create Razorpay order with gateway provider.",
      });
    }

    // 6. Create NEW Payment Attempt Document (Attempt #N)
    let newPayment;
    try {
      newPayment = new Payment({
        bookingId: lockedBooking._id,
        userId: buyerId,
        attemptNumber: nextAttemptNumber,
        provider: "Razorpay",
        providerOrderId: order.id,
        amount: Number(lockedBooking.totalPrice),
        amountSubunits: amountInSubunits,
        currency: "INR",
        status: "Pending",
      });
      await newPayment.save();
    } catch (payErr) {
      try {
        lockedBooking.paymentStatus = previousPaymentStatus;
        if (previousRazorpayOrderId) lockedBooking.razorpayOrderId = previousRazorpayOrderId;
        lockedBooking.status = previousBookingStatus;
        await lockedBooking.save();
      } catch (rollbackErr) {
        console.error("Failed to restore booking state after payment creation failure:", rollbackErr);
      }
      return res.status(500).json({
        success: false,
        message: "Failed to create payment attempt record.",
      });
    }

    // 7. Update razorpayOrderId & activePaymentId on EXISTING booking
    try {
      lockedBooking.razorpayOrderId = order.id;
      lockedBooking.activePaymentId = newPayment._id;
      lockedBooking.paymentStatus = "Pending";
      lockedBooking.status = "Pending";
      await lockedBooking.save();
    } catch (dbErr) {
      // ROLLBACK SAFETY: Recovery attempt if MongoDB save fails after Razorpay order creation
      try {
        await Payment.findByIdAndDelete(newPayment._id);
        lockedBooking.paymentStatus = previousPaymentStatus;
        if (previousRazorpayOrderId) lockedBooking.razorpayOrderId = previousRazorpayOrderId;
        lockedBooking.status = previousBookingStatus;
        await lockedBooking.save();
      } catch (rollbackErr) {
        console.error("Critical: Failed to restore booking state after DB save failure:", rollbackErr);
      }
      return res.status(500).json({
        success: false,
        message: "Failed to update booking record with new payment order.",
      });
    }

    return res.status(200).json({
      success: true,
      bookingId: lockedBooking._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: key_id,
    });
  } catch (error) {
    next(error);
  }
};

// Server-Side HMAC SHA256 Verification & Atomic Booking Confirmation Callback
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Razorpay API keys are not configured.",
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Incomplete payment verification payload.",
      });
    }

    // Find the associated Pending Booking by razorpayOrderId (Must match active razorpayOrderId)
    const existingBooking = await Booking.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!existingBooking) {
      return res.status(404).json({
        success: false,
        message: "No pending booking record found matching this Razorpay order.",
      });
    }

    // If booking is already confirmed, return idempotently
    if (existingBooking.paymentStatus === "Captured" && existingBooking.status === "Confirmed") {
      return res.status(200).json({
        success: true,
        message: "Booking already confirmed for this payment.",
        booking: existingBooking,
      });
    }

    // 1. HMAC SHA256 signature verification using RAZORPAY_KEY_SECRET
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(body.toString())
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const actualBuffer = Buffer.from(razorpay_signature, "utf-8");

    const isVerified =
      expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);

    if (!isVerified) {
      return res.status(400).json({
        success: false,
        message: "Payment signature verification failed. Invalid transaction signature.",
      });
    }

    // 2. Reconstruct expected amount from server-authoritative stored booking totalPrice
    const expectedTotalPrice = Number(existingBooking.totalPrice);
    const expectedAmountInSubunits = Math.round(expectedTotalPrice * 100);
    const expectedCurrency = "INR";

    // 3. Fetch Razorpay Order & Payment via SDK to verify amounts, binding, and capture status
    const razorpayInstance = new Razorpay({ key_id, key_secret });

    let razorpayOrder;
    try {
      razorpayOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: "Razorpay order not found.",
      });
    }

    let razorpayPayment;
    try {
      razorpayPayment = await razorpayInstance.payments.fetch(razorpay_payment_id);
    } catch (err) {
      return res.status(404).json({
        success: false,
        message: "Razorpay payment not found.",
      });
    }

    // Verify Razorpay Order details
    if (
      razorpayOrder.amount !== expectedAmountInSubunits ||
      razorpayOrder.currency !== expectedCurrency
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay order amount or currency mismatch.",
      });
    }

    // Verify Payment belongs to the expected Order
    if (razorpayPayment.order_id !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: "Payment does not belong to the specified order.",
      });
    }

    // Verify Payment amount & currency
    if (
      razorpayPayment.amount !== expectedAmountInSubunits ||
      razorpayPayment.currency !== expectedCurrency
    ) {
      return res.status(400).json({
        success: false,
        message: "Razorpay payment amount or currency mismatch.",
      });
    }

    // Verify Payment capture status
    if (razorpayPayment.status !== "captured") {
      return res.status(400).json({
        success: false,
        message: `Payment status is '${razorpayPayment.status}'. Only captured payments are accepted.`,
      });
    }

    // 4. Update Payment Attempt document to Captured
    await Payment.findOneAndUpdate(
      {
        providerOrderId: razorpay_order_id,
        status: { $ne: "Captured" },
      },
      {
        $set: {
          status: "Captured",
          providerPaymentId: razorpay_payment_id,
          capturedAt: new Date(),
        },
      }
    );

    // 5. Atomic conditional update of Booking to prevent callback + webhook race conditions
    const updatedBooking = await Booking.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
        paymentStatus: { $ne: "Captured" },
      },
      {
        $set: {
          status: "Confirmed",
          paymentStatus: "Captured",
          razorpayPaymentId: razorpay_payment_id,
          paidAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedBooking) {
      const currentBooking = await Booking.findOne({ razorpayOrderId: razorpay_order_id });
      return res.status(200).json({
        success: true,
        message: "Booking already confirmed for this payment.",
        booking: currentBooking,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment Verified & Booking Confirmed!",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// Asynchronous Razorpay Webhook Endpoint
export const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Razorpay webhook secret is missing.",
      });
    }

    const signature = req.headers["x-razorpay-signature"];
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: "Missing x-razorpay-signature header.",
      });
    }

    // Retrieve raw request body for HMAC SHA256 verification
    const rawBodyBuffer = req.rawBody || (typeof req.body === "string" ? Buffer.from(req.body) : Buffer.from(JSON.stringify(req.body)));

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBodyBuffer)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
    const actualBuffer = Buffer.from(signature, "utf-8");

    const isValidSignature =
      expectedBuffer.length === actualBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, actualBuffer);

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: "Invalid Razorpay webhook signature.",
      });
    }

    const eventData = req.body;
    const eventType = eventData?.event;
    const eventId = eventData?.event_id || `evt_${Date.now()}`;

    if (eventType === "payment.captured") {
      const paymentEntity = eventData?.payload?.payment?.entity;
      if (!paymentEntity) {
        return res.status(400).json({ success: false, message: "Invalid payment captured payload." });
      }

      const { order_id, id: payment_id, amount, currency, status } = paymentEntity;

      const booking = await Booking.findOne({ razorpayOrderId: order_id });
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found for order." });
      }

      // Idempotency check: Ignore duplicate events if already captured
      if (booking.paymentStatus === "Captured") {
        return res.status(200).json({
          success: true,
          message: "Webhook ignored: Payment already captured.",
        });
      }

      // Verify amounts and status against stored booking totalPrice
      const expectedTotalPrice = Number(booking.totalPrice);
      const expectedAmountInSubunits = Math.round(expectedTotalPrice * 100);

      if (
        amount !== expectedAmountInSubunits ||
        currency !== "INR" ||
        status !== "captured"
      ) {
        return res.status(400).json({
          success: false,
          message: "Webhook payment amount, currency, or status mismatch.",
        });
      }

      // Atomic update of Payment Attempt document
      await Payment.findOneAndUpdate(
        {
          providerOrderId: order_id,
          status: { $ne: "Captured" },
        },
        {
          $set: {
            status: "Captured",
            providerPaymentId: payment_id,
            capturedAt: new Date(),
          },
        }
      );

      // Atomic update of Booking
      const updatedBooking = await Booking.findOneAndUpdate(
        {
          razorpayOrderId: order_id,
          paymentStatus: { $ne: "Captured" },
        },
        {
          $set: {
            status: "Confirmed",
            paymentStatus: "Captured",
            razorpayPaymentId: payment_id,
            paidAt: new Date(),
            webhookEventId: eventId,
          },
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: "Webhook payment captured & booking confirmed.",
        booking: updatedBooking || booking,
      });
    } else if (eventType === "payment.failed") {
      const paymentEntity = eventData?.payload?.payment?.entity;
      if (!paymentEntity) {
        return res.status(400).json({ success: false, message: "Invalid payment failed payload." });
      }

      const { order_id } = paymentEntity;
      const booking = await Booking.findOne({ razorpayOrderId: order_id });
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found for order." });
      }

      // Do not overwrite an already captured payment
      if (booking.paymentStatus === "Captured") {
        return res.status(200).json({
          success: true,
          message: "Webhook ignored: Payment already captured.",
        });
      }

      // Update Payment Attempt record status to Failed
      await Payment.findOneAndUpdate(
        {
          providerOrderId: order_id,
          status: { $ne: "Captured" },
        },
        {
          $set: {
            status: "Failed",
            failureReason: paymentEntity?.error_description || "Payment failed at gateway",
          },
        }
      );

      // Update Booking ONLY if order_id matches active order
      await Booking.findOneAndUpdate(
        {
          razorpayOrderId: order_id,
          paymentStatus: { $ne: "Captured" },
        },
        {
          $set: {
            paymentStatus: "Failed",
            status: "Pending", // Keep status as Pending to allow retry
          },
        }
      );

      return res.status(200).json({
        success: true,
        message: "Webhook payment failure recorded.",
      });
    } else if (eventType === "refund.processed") {
      const refundEntity = eventData?.payload?.refund?.entity || eventData?.payload?.payment?.entity;
      if (!refundEntity) {
        return res.status(400).json({ success: false, message: "Invalid refund.processed payload." });
      }

      const { id: provider_refund_id, payment_id, amount } = refundEntity;

      let refund = await Refund.findOne({ providerRefundId: provider_refund_id });
      if (!refund && payment_id) {
        const payment = await Payment.findOne({ providerPaymentId: payment_id });
        if (payment) {
          refund = await Refund.findOne({ paymentId: payment._id, status: "Pending", amountSubunits: amount });
        }
      }

      if (!refund) {
        return res.status(200).json({
          success: true,
          message: "Webhook processed: No matching pending refund document found or already processed.",
        });
      }

      const payment = await Payment.findById(refund.paymentId);
      if (!payment || String(payment.bookingId) !== String(refund.bookingId)) {
        return res.status(400).json({ success: false, message: "Refund payment/booking hierarchy mismatch." });
      }

      if (amount && refund.amountSubunits && Number(amount) !== Number(refund.amountSubunits)) {
        console.error(`[WEBHOOK DISCREPANCY] Event ${eventId}: Refund amount mismatch. Webhook: ${amount}, DB: ${refund.amountSubunits}`);
        return res.status(400).json({ success: false, message: "Refund webhook amount mismatch." });
      }

      if (refund.status === "Processed") {
        return res.status(200).json({
          success: true,
          message: "Webhook ignored: Refund already processed.",
        });
      }

      if (refund.status === "Failed") {
        return res.status(200).json({
          success: true,
          message: "Webhook ignored: Refund is in terminal Failed state.",
        });
      }

      const updatedRefund = await Refund.findOneAndUpdate(
        { _id: refund._id, status: "Pending" },
        {
          $set: {
            status: "Processed",
            providerRefundId: provider_refund_id,
            processedAt: new Date(),
          },
        },
        { new: true }
      );

      if (!updatedRefund) {
        return res.status(200).json({
          success: true,
          message: "Webhook processed idempotently (state already changed).",
        });
      }

      const currentTotalRefunded = Number(payment.refundedAmount || 0);
      const originalPaymentAmount = Number(payment.amount);
      const calculatedRefundStatus =
        currentTotalRefunded === 0
          ? "Unrefunded"
          : currentTotalRefunded >= originalPaymentAmount
          ? "Fully_Refunded"
          : "Partially_Refunded";

      if (payment.refundStatus !== calculatedRefundStatus) {
        await Payment.findByIdAndUpdate(payment._id, { $set: { refundStatus: calculatedRefundStatus } });
      }

      // Update associated Booking if in Cancellation_Requested state or if refund is flagged for cancellation
      const targetBooking = await Booking.findById(refund.bookingId);
      if (targetBooking && (targetBooking.status === "Cancellation_Requested" || refund.isCancellation)) {
        await Booking.findByIdAndUpdate(refund.bookingId, { $set: { status: "Cancelled" } });
      }

      return res.status(200).json({
        success: true,
        message: "Webhook refund.processed successfully recorded.",
        refund: updatedRefund,
      });
    } else if (eventType === "refund.failed") {
      const refundEntity = eventData?.payload?.refund?.entity || eventData?.payload?.payment?.entity;
      if (!refundEntity) {
        return res.status(400).json({ success: false, message: "Invalid refund.failed payload." });
      }

      const { id: provider_refund_id, payment_id, error_description } = refundEntity;

      let refund = await Refund.findOne({ providerRefundId: provider_refund_id });
      if (!refund && payment_id) {
        const payment = await Payment.findOne({ providerPaymentId: payment_id });
        if (payment) {
          refund = await Refund.findOne({ paymentId: payment._id, status: "Pending" });
        }
      }

      if (!refund) {
        return res.status(200).json({
          success: true,
          message: "Webhook processed: No matching refund document found for failure event.",
        });
      }

      const payment = await Payment.findById(refund.paymentId);
      if (!payment || String(payment.bookingId) !== String(refund.bookingId)) {
        return res.status(400).json({ success: false, message: "Refund payment/booking hierarchy mismatch." });
      }

      if (refund.status === "Failed") {
        return res.status(200).json({
          success: true,
          message: "Webhook ignored: Refund already marked as Failed.",
        });
      }

      if (refund.status === "Processed") {
        return res.status(200).json({
          success: true,
          message: "Webhook ignored: Processed refund cannot be marked as Failed.",
        });
      }

      const updatedRefund = await Refund.findOneAndUpdate(
        { _id: refund._id, status: "Pending" },
        {
          $set: {
            status: "Failed",
            failureReason: error_description || "Razorpay refund failed (webhook event)",
          },
        },
        { new: true }
      );

      if (!updatedRefund) {
        return res.status(200).json({
          success: true,
          message: "Webhook processed idempotently (state already changed).",
        });
      }

      const refundAmountMajor = Number(refund.amount);
      const updatedPayment = await Payment.findOneAndUpdate(
        { _id: payment._id },
        { $inc: { refundedAmount: -refundAmountMajor } },
        { new: true }
      );

      if (updatedPayment) {
        if (updatedPayment.refundedAmount < 0) {
          await Payment.findByIdAndUpdate(payment._id, { $set: { refundedAmount: 0 } });
          updatedPayment.refundedAmount = 0;
        }

        const originalPaymentAmount = Number(updatedPayment.amount);
        const calculatedRefundStatus =
          updatedPayment.refundedAmount === 0
            ? "Unrefunded"
            : updatedPayment.refundedAmount >= originalPaymentAmount
            ? "Fully_Refunded"
            : "Partially_Refunded";

        await Payment.findByIdAndUpdate(payment._id, { $set: { refundStatus: calculatedRefundStatus } });
      }

      return res.status(200).json({
        success: true,
        message: "Webhook refund.failed recorded and reserved balance released.",
        refund: updatedRefund,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Unhandled event '${eventType}' acknowledged.`,
    });
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

    const rawSearch = req.query.searchTerm || "";
    const statusFilter = req.query.status || "";

    // 1. Server-side Aggregation for Gross Captured Revenue & Refunds
    const revenueAggregation = await Payment.aggregate([
      {
        $match: {
          status: "Captured",
          currency: "INR",
        },
      },
      {
        $group: {
          _id: null,
          totalCapturedRevenue: { $sum: "$amount" },
          capturedCount: { $sum: 1 },
        },
      },
    ]);

    const refundAggregation = await Refund.aggregate([
      {
        $match: {
          status: "Processed",
          currency: "INR",
        },
      },
      {
        $group: {
          _id: null,
          totalRefunded: { $sum: "$amount" },
          processedCount: { $sum: 1 },
        },
      },
    ]);

    const totalCapturedRevenue = revenueAggregation[0]?.totalCapturedRevenue || 0;
    const capturedCount = revenueAggregation[0]?.capturedCount || 0;
    const totalAttemptsCount = await Payment.countDocuments({});

    const totalRefunded = refundAggregation[0]?.totalRefunded || 0;
    const processedRefundCount = refundAggregation[0]?.processedCount || 0;
    const pendingRefundCount = await Refund.countDocuments({ status: "Pending" });
    const failedRefundCount = await Refund.countDocuments({ status: "Failed" });
    const netRevenue = totalCapturedRevenue - totalRefunded;

    // 2. Fetch Payment documents with populated booking & user details
    const paymentQuery = {};
    if (statusFilter && ["Pending", "Processing", "Captured", "Failed"].includes(statusFilter)) {
      paymentQuery.status = statusFilter;
    }

    const safeSearch = escapeRegex(String(rawSearch));

    const payments = await Payment.find(paymentQuery)
      .populate({
        path: "bookingId",
        populate: { path: "packageDetails", select: "packageName packageDestination packagePrice" },
      })
      .populate("userId", "username email phone")
      .sort({ createdAt: -1 });

    // Filter by search query if provided
    const filteredPayments = payments.filter((p) => {
      if (!rawSearch) return true;
      const username = p.userId?.username || "";
      const email = p.userId?.email || "";
      const orderId = p.providerOrderId || "";
      const paymentId = p.providerPaymentId || "";
      const pkgName = p.bookingId?.packageDetails?.packageName || "";
      const searchRegex = new RegExp(safeSearch, "i");
      return (
        searchRegex.test(username) ||
        searchRegex.test(email) ||
        searchRegex.test(orderId) ||
        searchRegex.test(paymentId) ||
        searchRegex.test(pkgName)
      );
    });

    // Format ledger items & flag price discrepancies
    const ledgerItems = filteredPayments.map((p) => {
      const bookingTotalPrice = p.bookingId?.totalPrice;
      const isPriceDiscrepancy =
        p.status === "Captured" &&
        bookingTotalPrice !== undefined &&
        Number(bookingTotalPrice) !== Number(p.amount);

      const refundedAmount = Number(p.refundedAmount || 0);
      const originalAmount = Number(p.amount);
      const refundableBalance = Math.max(0, originalAmount - refundedAmount);

      return {
        _id: p._id,
        bookingId: p.bookingId?._id || p.bookingId,
        bookingStatus: p.bookingId?.status || "N/A",
        packageName: p.bookingId?.packageDetails?.packageName || "Tour Package",
        packageDestination: p.bookingId?.packageDetails?.packageDestination || "",
        buyerUsername: p.userId?.username || "N/A",
        buyerEmail: p.userId?.email || "N/A",
        attemptNumber: p.attemptNumber,
        provider: p.provider,
        providerOrderId: p.providerOrderId,
        providerPaymentId: p.providerPaymentId || "N/A",
        amount: p.amount,
        amountSubunits: p.amountSubunits,
        refundedAmount: refundedAmount,
        refundableBalance: refundableBalance,
        refundStatus: p.refundStatus || "Unrefunded",
        currency: p.currency,
        status: p.status,
        failureReason: p.failureReason || null,
        capturedAt: p.capturedAt || null,
        createdAt: p.createdAt,
        travelDate: p.bookingId?.date || "N/A",
        bookingTotalPrice: bookingTotalPrice,
        isPriceDiscrepancy: Boolean(isPriceDiscrepancy),
      };
    });

    // 3. Fetch Refund records with populated references
    const rawRefunds = await Refund.find({})
      .populate({
        path: "bookingId",
        select: "status totalPrice date packageDetails",
        populate: { path: "packageDetails", select: "packageName" },
      })
      .populate("paymentId", "providerPaymentId providerOrderId amount refundedAmount refundStatus")
      .populate("userId", "username email")
      .populate("initiatedBy", "username email")
      .sort({ createdAt: -1 });

    const refundList = rawRefunds.map((r) => ({
      _id: r._id,
      bookingId: r.bookingId?._id || r.bookingId,
      bookingStatus: r.bookingId?.status || "N/A",
      packageName: r.bookingId?.packageDetails?.packageName || "Tour Package",
      paymentId: r.paymentId?._id || r.paymentId,
      providerPaymentId: r.paymentId?.providerPaymentId || "N/A",
      providerOrderId: r.paymentId?.providerOrderId || "N/A",
      providerRefundId: r.providerRefundId || "N/A",
      buyerUsername: r.userId?.username || "N/A",
      buyerEmail: r.userId?.email || "N/A",
      initiatedByUsername: r.initiatedBy?.username || "Admin",
      amount: r.amount,
      amountSubunits: r.amountSubunits,
      currency: r.currency,
      status: r.status,
      reason: r.reason || "N/A",
      failureReason: r.failureReason || null,
      idempotencyKey: r.idempotencyKey,
      isCancellation: Boolean(r.isCancellation),
      processedAt: r.processedAt || null,
      createdAt: r.createdAt,
    }));

    return res.status(200).json({
      success: true,
      metrics: {
        totalCapturedRevenue,
        capturedCount,
        totalAttemptsCount,
        totalRefunded,
        netRevenue,
        processedRefundCount,
        pendingRefundCount,
        failedRefundCount,
      },
      payments: ledgerItems,
      refunds: refundList,
    });
  } catch (error) {
    next(error);
  }
};

// Reusable Server-Authoritative Refund Execution Helper
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

// Admin Initiate Refund Controller (Server-Authoritative & Atomic)
export const adminInitiateRefund = async (req, res, next) => {
  try {
    // 1. Authorization check
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

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    let payment = null;
    if (booking.activePaymentId) {
      payment = await Payment.findOne({
        _id: booking.activePaymentId,
        bookingId: booking._id,
        status: "Captured",
        currency: "INR",
        provider: "Razorpay",
      });
    }

    if (!payment) {
      payment = await Payment.findOne({
        bookingId: booking._id,
        status: "Captured",
        currency: "INR",
        provider: "Razorpay",
      });
    }

    if (!payment || !payment.providerPaymentId) {
      return res.status(400).json({
        success: false,
        message: "No captured Razorpay payment found for this booking.",
      });
    }

    if (booking.razorpayPaymentId && payment.providerPaymentId !== booking.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: "Captured payment provider payment ID mismatch with booking.",
      });
    }

    const refundResult = await executeRefundLogic({
      booking,
      payment,
      amount: numericAmount,
      reason,
      idempotencyKey: trimmedIdempotencyKey,
      initiatedBy: req.user._id,
      isCancellation: false,
    });

    return res.status(refundResult.statusCode || (refundResult.success ? 200 : 400)).json(refundResult);
  } catch (error) {
    next(error);
  }
};


import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    packageDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    persons: {
      type: Number,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    returnDate: {
      type: String,
      default: "",
    },
    adults: {
      type: Number,
      default: 1,
    },
    children: {
      type: Number,
      default: 0,
    },
    infants: {
      type: Number,
      default: 0,
    },
    rooms: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Approved", "Booked", "Cancellation_Requested", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Processing", "Captured", "Failed"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      default: "Razorpay",
    },
    activePaymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      index: true,
    },
    razorpayOrderId: {
      type: String,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
    },
    webhookEventId: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
    travellerManifestCompleted: {
      type: Boolean,
      default: false,
    },
    hotelSnapshot: {
      type: Object,
      default: null,
    },
    selectedRoom: {
      type: Object,
      default: null,
    },
    selectedAddOns: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

bookingSchema.index({ buyer: 1 });

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;

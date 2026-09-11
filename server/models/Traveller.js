import mongoose from "mongoose";

const travellerSchema = new mongoose.Schema(
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
    passengerNumber: {
      type: Number,
      required: true,
      min: [1, "Passenger number must be at least 1"],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: [0, "Age cannot be negative"],
      max: [120, "Age cannot exceed 120"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    idType: {
      type: String,
      required: true,
      enum: ["Passport", "National_ID", "Driving_License"],
      default: "Passport",
    },
    idNumber: {
      type: String,
      required: true,
      trim: true,
    },
    emergencyContactName: {
      type: String,
      trim: true,
      default: "",
    },
    emergencyContactPhone: {
      type: String,
      trim: true,
      default: "",
    },
    specialRequests: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

travellerSchema.index({ bookingId: 1, passengerNumber: 1 }, { unique: true });

const Traveller = mongoose.model("Traveller", travellerSchema);

export default Traveller;

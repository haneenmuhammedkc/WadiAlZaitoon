import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      required: [true, "Hotel name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Hotel location is required"],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
      index: true,
    },
    stay: {
      type: String,
      default: "5 Nights",
      trim: true,
    },
    roomType: {
      type: String,
      default: "Deluxe Room",
      trim: true,
    },
    mealPlan: {
      type: String,
      default: "Breakfast Included",
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.8,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: [0, "Reviews count cannot be negative"],
    },
    badge: {
      type: String,
      default: "LUXURY STAY",
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Hotel description is required"],
      trim: true,
    },
    amenities: {
      type: [String],
      default: [],
    },
    roomFeatures: {
      type: [String],
      default: [],
    },
    images: [
      {
        url: { type: String, required: true },
        label: { type: String, default: "Hotel Image" },
        alt: { type: String, default: "Hotel Image" },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

hotelSchema.index({ destination: 1, isActive: 1 });

const Hotel = mongoose.model("Hotel", hotelSchema);

export default Hotel;

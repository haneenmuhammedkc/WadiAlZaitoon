import mongoose from "mongoose";

const ratingsReviewsSchema = new mongoose.Schema(
  {
    rating: {
      type: Number,
    },
    review: {
      type: String,
    },
    packageId: {
      type: String,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

ratingsReviewsSchema.index({ packageId: 1 });

const RatingReview = mongoose.model("RatingReview", ratingsReviewsSchema);

export default RatingReview;

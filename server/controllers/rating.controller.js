import Package from "../models/package.model.js";
import RatingReview from "../models/ratings_reviews.model.js";
import { isValidObjectId } from "../utils/security.js";

export const giveRating = async (req, res, next) => {
  try {
    const { packageId, rating, review } = req.body;

    if (!isValidObjectId(packageId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid package ID format!",
      });
    }

    if (req.body.userRef && String(req.user._id) !== String(req.body.userRef)) {
      return res.status(403).send({
        success: false,
        message: "You can only give rating on your own account!",
      });
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).send({
        success: false,
        message: "Rating must be a number between 1 and 5 stars!",
      });
    }

    const targetPackage = await Package.findById(packageId);
    if (!targetPackage) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }

    const newRating = await RatingReview.create({
      rating: ratingNum,
      review: review ? String(review).trim() : "",
      packageId: String(packageId),
      userRef: String(req.user._id),
      username: req.user.username,
      userProfileImg: req.user.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
    });

    if (newRating) {
      const ratings = await RatingReview.find({ packageId });
      const totalRatings = ratings.length;
      let totalStars = 0;
      ratings.forEach((r) => {
        totalStars += Number(r.rating) || 0;
      });

      const average_rating = totalRatings > 0 ? Math.round((totalStars / totalRatings) * 10) / 10 : 0;

      await Package.findByIdAndUpdate(packageId, {
        $set: {
          packageRating: average_rating,
          packageTotalRatings: totalRatings,
        },
      });

      return res.status(201).send({
        success: true,
        message: "Thanks for your feedback!",
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Something went wrong while rating the package!",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const ratingGiven = async (req, res, next) => {
  try {
    const { userId, packageId } = req.params;

    if (!isValidObjectId(userId) || !isValidObjectId(packageId)) {
      return res.status(400).send({
        success: false,
        message: "Invalid ID format!",
      });
    }

    if (String(req.user._id) !== String(userId)) {
      return res.status(403).send({
        success: false,
        message: "Forbidden access to user rating status!",
      });
    }

    const rating_given = await RatingReview.findOne({
      userRef: userId,
      packageId: packageId,
    });

    return res.status(200).send({
      given: !!rating_given,
    });
  } catch (error) {
    next(error);
  }
};

export const averageRating = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid package ID format!",
      });
    }

    const ratings = await RatingReview.find({ packageId: req.params.id });
    const totalRatings = ratings.length;

    if (totalRatings === 0) {
      return res.status(200).send({
        rating: 0,
        totalRatings: 0,
      });
    }

    let totalStars = 0;
    ratings.forEach((r) => {
      totalStars += Number(r.rating) || 0;
    });

    const average = Math.round((totalStars / totalRatings) * 10) / 10;

    return res.status(200).send({
      rating: average,
      totalRatings: totalRatings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllRatings = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid package ID format!",
      });
    }

    const limitNum = Math.max(1, Math.min(100, parseInt(req.params.limit) || 10));

    const ratings = await RatingReview.find({
      packageId: req.params.id,
    })
      .limit(limitNum)
      .sort({ createdAt: -1 });

    return res.status(200).send(ratings || []);
  } catch (error) {
    next(error);
  }
};

import Package from "../models/package.model.js";
import { escapeRegex, isValidObjectId } from "../utils/security.js";

//create package
export const createPackage = async (req, res, next) => {
  try {
    const {
      packageName,
      packageDescription,
      packageDestination,
      packageDays,
      packageNights,
      packageAccommodation,
      packageTransportation,
      packageMeals,
      packageActivities,
      packagePrice,
      packageDiscountPrice,
      packageOffer,
      packageImages,
      hotel,
    } = req.body;

    if (
      !packageName ||
      !packageDescription ||
      !packageDestination ||
      !packageAccommodation ||
      !packageTransportation ||
      !packageMeals ||
      !packageActivities ||
      packageOffer === undefined || packageOffer === null ||
      !packageImages ||
      !Array.isArray(packageImages)
    ) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const price = Number(packagePrice);
    const discountPrice = Number(packageDiscountPrice);
    const days = Number(packageDays);
    const nights = Number(packageNights);

    if (isNaN(price) || isNaN(discountPrice) || price <= 0 || discountPrice < 0) {
      return res.status(400).send({
        success: false,
        message: "Price should be a valid number greater than 0!",
      });
    }

    if (price < discountPrice) {
      return res.status(400).send({
        success: false,
        message: "Regular price should be greater than discount price!",
      });
    }

    if (isNaN(days) || isNaN(nights) || (days <= 0 && nights <= 0)) {
      return res.status(400).send({
        success: false,
        message: "Provide valid days and nights!",
      });
    }

    let validHotelId = null;
    if (hotel && isValidObjectId(hotel)) {
      validHotelId = hotel;
    }

    const newPackage = await Package.create({
      packageName: String(packageName).trim(),
      packageDescription: String(packageDescription).trim(),
      packageDestination: String(packageDestination).trim(),
      packageDays: days,
      packageNights: nights,
      packageAccommodation: String(packageAccommodation).trim(),
      packageTransportation: String(packageTransportation).trim(),
      packageMeals: String(packageMeals).trim(),
      packageActivities: String(packageActivities).trim(),
      packagePrice: price,
      packageDiscountPrice: discountPrice,
      packageOffer: Boolean(packageOffer),
      packageImages,
      hotel: validHotelId,
    });

    if (newPackage) {
      return res.status(201).send({
        success: true,
        message: "Package created successfully",
        package: newPackage,
      });
    } else {
      return res.status(500).send({
        success: false,
        message: "Something went wrong",
      });
    }
  } catch (error) {
    next(error);
  }
};

//get all packages
export const getPackages = async (req, res, next) => {
  try {
    const rawSearch = req.query.searchTerm || "";
    const safeSearch = escapeRegex(String(rawSearch));

    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit) || 50));
    const startIndex = Math.max(0, parseInt(req.query.startIndex) || 0);

    let offerFilter;
    const rawOffer = req.query.offer;
    if (typeof rawOffer === "object" || rawOffer === undefined || rawOffer === "false") {
      offerFilter = { $in: [false, true] };
    } else {
      offerFilter = rawOffer === "true";
    }

    const allowedSorts = ["createdAt", "packagePrice", "packageRating", "packageName"];
    const sort = allowedSorts.includes(req.query.sort) ? req.query.sort : "createdAt";

    const allowedOrders = ["asc", "desc"];
    const order = allowedOrders.includes(req.query.order) ? req.query.order : "desc";

    const packages = await Package.find({
      $or: [
        { packageName: { $regex: safeSearch, $options: "i" } },
        { packageDestination: { $regex: safeSearch, $options: "i" } },
      ],
      packageOffer: offerFilter,
    })
      .populate("hotel")
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);

    return res.status(200).send({
      success: true,
      packages: packages || [],
    });
  } catch (error) {
    next(error);
  }
};

//get package data
export const getPackageData = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid package ID format!",
      });
    }

    const packageData = await Package.findById(req.params.id).populate("hotel");
    if (!packageData) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }
    return res.status(200).send({
      success: true,
      packageData,
    });
  } catch (error) {
    next(error);
  }
};

//update package
export const updatePackage = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid package ID format!",
      });
    }

    const findPackage = await Package.findById(req.params.id);
    if (!findPackage) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }

    const allowedUpdates = [
      "packageName",
      "packageDescription",
      "packageDestination",
      "packageDays",
      "packageNights",
      "packageAccommodation",
      "packageTransportation",
      "packageMeals",
      "packageActivities",
      "packagePrice",
      "packageDiscountPrice",
      "packageOffer",
      "packageImages",
      "hotel",
    ];

    const updateFields = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        if (key === "hotel") {
          updateFields.hotel = req.body.hotel && isValidObjectId(req.body.hotel) ? req.body.hotel : null;
        } else if (key === "packageImages") {
          if (!Array.isArray(req.body.packageImages)) {
            return res.status(400).send({
              success: false,
              message: "packageImages must be an array of URLs!",
            });
          }
          if (req.body.packageImages.length > 5) {
            return res.status(400).send({
              success: false,
              message: "Maximum 5 package images allowed!",
            });
          }
          updateFields.packageImages = req.body.packageImages
            .filter((url) => typeof url === "string" && /^https?:\/\/.+/i.test(url.trim()))
            .slice(0, 5);
        } else {
          updateFields[key] = req.body[key];
        }
      }
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).populate("hotel");

    return res.status(200).send({
      success: true,
      message: "Package updated successfully!",
      updatedPackage,
    });
  } catch (error) {
    next(error);
  }
};

//delete package
export const deletePackage = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid package ID format!",
      });
    }

    const deleted = await Package.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).send({
        success: false,
        message: "Package not found!",
      });
    }

    return res.status(200).send({
      success: true,
      message: "Package Deleted!",
    });
  } catch (error) {
    next(error);
  }
};

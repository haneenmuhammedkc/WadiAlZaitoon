import Hotel from "../models/Hotel.js";
import { escapeRegex, isValidObjectId } from "../utils/security.js";

// Public — Get All Active Hotels (supports search & destination filters)
export const getHotels = async (req, res, next) => {
  try {
    const rawSearch = req.query.searchTerm || "";
    const rawDest = req.query.destination || "";
    const showAll = req.query.adminView === "true" && req.user && (req.user.user_role === 1 || req.user.userType === "admin" || req.user.isAdmin);

    const safeSearch = escapeRegex(String(rawSearch));
    const safeDest = escapeRegex(String(rawDest));

    const query = {};

    if (!showAll) {
      query.isActive = true;
    }

    if (rawDest && rawDest !== "All Stays") {
      query.destination = { $regex: new RegExp(`^${safeDest}$`, "i") };
    }

    if (rawSearch) {
      const searchRegex = new RegExp(safeSearch, "i");
      query.$or = [
        { hotelName: searchRegex },
        { location: searchRegex },
        { destination: searchRegex },
        { description: searchRegex },
      ];
    }

    const hotels = await Hotel.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    next(error);
  }
};

// Public — Get Single Hotel Details by ID
export const getHotelById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid hotel ID format!",
      });
    }

    const hotel = await Hotel.findById(id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found!",
      });
    }

    const isAdminUser =
      req.user &&
      (req.user.user_role === 1 || req.user.userType === "admin" || req.user.isAdmin);

    if (!hotel.isActive && !isAdminUser) {
      return res.status(404).json({
        success: false,
        message: "Hotel is currently inactive or not available.",
      });
    }

    return res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    next(error);
  }
};

// Admin — Create New Hotel Document
export const createHotel = async (req, res, next) => {
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

    const {
      hotelName,
      packageName,
      packageId,
      location,
      destination,
      stay,
      roomType,
      mealPlan,
      rating,
      reviewsCount,
      badge,
      description,
      amenities,
      roomFeatures,
      images,
      isActive,
    } = req.body;

    if (!hotelName || !String(hotelName).trim()) {
      return res.status(400).json({ success: false, message: "Hotel name is required." });
    }
    if (!location || !String(location).trim()) {
      return res.status(400).json({ success: false, message: "Location is required." });
    }
    if (!destination || !String(destination).trim()) {
      return res.status(400).json({ success: false, message: "Destination is required." });
    }
    if (!description || !String(description).trim()) {
      return res.status(400).json({ success: false, message: "Description is required." });
    }

    const ratingNum = rating !== undefined ? Number(rating) : 4.8;
    if (isNaN(ratingNum) || ratingNum < 0 || ratingNum > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 0 and 5." });
    }

    const reviewsCountNum = reviewsCount !== undefined ? Number(reviewsCount) : 0;
    if (isNaN(reviewsCountNum) || reviewsCountNum < 0) {
      return res.status(400).json({ success: false, message: "Reviews count cannot be negative." });
    }

    const sanitizedImages = Array.isArray(images)
      ? images
          .filter((img) => img && (img.url || img.src))
          .map((img) => ({
            url: String(img.url || img.src).trim(),
            label: img.label ? String(img.label).trim() : "Hotel Image",
            alt: img.alt ? String(img.alt).trim() : "Hotel Image",
          }))
      : [];

    if (sanitizedImages.length === 0) {
      return res.status(400).json({ success: false, message: "At least one valid image is required for a hotel." });
    }

    // Mass-assignment protection: strict field extraction
    const hotelData = {
      hotelName: String(hotelName).trim(),
      packageName: packageName ? String(packageName).trim() : "",
      packageId: packageId || null,
      location: String(location).trim(),
      destination: String(destination).trim(),
      stay: stay ? String(stay).trim() : "5 Nights",
      roomType: roomType ? String(roomType).trim() : "Deluxe Room",
      mealPlan: mealPlan ? String(mealPlan).trim() : "Breakfast Included",
      rating: ratingNum,
      reviewsCount: reviewsCountNum,
      badge: badge ? String(badge).trim() : "LUXURY STAY",
      description: String(description).trim(),
      amenities: Array.isArray(amenities) ? amenities.map((a) => String(a).trim()) : [],
      roomFeatures: Array.isArray(roomFeatures) ? roomFeatures.map((rf) => String(rf).trim()) : [],
      images: sanitizedImages,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    };

    const newHotel = await Hotel.create(hotelData);

    return res.status(201).json({
      success: true,
      message: "Hotel created successfully!",
      hotel: newHotel,
    });
  } catch (error) {
    next(error);
  }
};

// Admin — Update Hotel Document
export const updateHotel = async (req, res, next) => {
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

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid hotel ID format!" });
    }

    const existingHotel = await Hotel.findById(id);
    if (!existingHotel) {
      return res.status(404).json({ success: false, message: "Hotel not found!" });
    }

    const allowedUpdates = {};
    const {
      hotelName,
      packageName,
      packageId,
      location,
      destination,
      stay,
      roomType,
      mealPlan,
      rating,
      reviewsCount,
      badge,
      description,
      amenities,
      roomFeatures,
      images,
      isActive,
    } = req.body;

    if (hotelName !== undefined) allowedUpdates.hotelName = String(hotelName).trim();
    if (packageName !== undefined) allowedUpdates.packageName = String(packageName).trim();
    if (packageId !== undefined) allowedUpdates.packageId = packageId || null;
    if (location !== undefined) allowedUpdates.location = String(location).trim();
    if (destination !== undefined) allowedUpdates.destination = String(destination).trim();
    if (stay !== undefined) allowedUpdates.stay = String(stay).trim();
    if (roomType !== undefined) allowedUpdates.roomType = String(roomType).trim();
    if (mealPlan !== undefined) allowedUpdates.mealPlan = String(mealPlan).trim();
    if (badge !== undefined) allowedUpdates.badge = String(badge).trim();
    if (description !== undefined) allowedUpdates.description = String(description).trim();

    if (rating !== undefined) {
      const rNum = Number(rating);
      if (isNaN(rNum) || rNum < 0 || rNum > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 0 and 5." });
      }
      allowedUpdates.rating = rNum;
    }

    if (reviewsCount !== undefined) {
      const rcNum = Number(reviewsCount);
      if (isNaN(rcNum) || rcNum < 0) {
        return res.status(400).json({ success: false, message: "Reviews count cannot be negative." });
      }
      allowedUpdates.reviewsCount = rcNum;
    }

    if (Array.isArray(amenities)) {
      allowedUpdates.amenities = amenities.map((a) => String(a).trim());
    }
    if (Array.isArray(roomFeatures)) {
      allowedUpdates.roomFeatures = roomFeatures.map((rf) => String(rf).trim());
    }

    if (Array.isArray(images)) {
      const sanitizedImages = images
        .filter((img) => img && (img.url || img.src))
        .map((img) => ({
          url: String(img.url || img.src).trim(),
          label: img.label ? String(img.label).trim() : "Hotel Image",
          alt: img.alt ? String(img.alt).trim() : "Hotel Image",
        }));
      if (sanitizedImages.length > 0) {
        allowedUpdates.images = sanitizedImages;
      }
    }

    if (isActive !== undefined) {
      allowedUpdates.isActive = Boolean(isActive);
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Hotel updated successfully!",
      hotel: updatedHotel,
    });
  } catch (error) {
    next(error);
  }
};

// Admin — Soft-Delete / Deactivate Hotel
export const deleteHotel = async (req, res, next) => {
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

    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid hotel ID format!" });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: "Hotel not found!" });
    }

    // Safe Soft-Delete / Deactivation
    hotel.isActive = false;
    await hotel.save();

    return res.status(200).json({
      success: true,
      message: "Hotel deactivated successfully!",
      hotelId: hotel._id,
      isActive: false,
    });
  } catch (error) {
    next(error);
  }
};

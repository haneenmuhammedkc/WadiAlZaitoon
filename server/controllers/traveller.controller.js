import Booking from "../models/booking.model.js";
import Traveller from "../models/traveller.model.js";
import { escapeRegex, isValidObjectId } from "../utils/security.js";

// Helper function to mask sensitive ID numbers for customer responses
export const maskIdNumber = (idStr) => {
  if (!idStr || typeof idStr !== "string") return "****";
  const trimmed = idStr.trim();
  if (trimmed.length <= 4) return "****";
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-2);
  const maskedMiddle = "*".repeat(Math.max(2, trimmed.length - 6));
  return `${prefix}${maskedMiddle}${suffix}`;
};

// Customer — Submit or Update Complete Passenger Manifest for a Booking
export const submitBookingManifest = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format!",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    // Authorization: Only the buyer or an admin can submit/update traveller details
    const isAdminUser =
      req.user &&
      (req.user.user_role === 1 || req.user.userType === "admin" || req.user.isAdmin);
    const isBuyer = String(booking.buyer) === String(req.user._id);

    if (!isAdminUser && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit passenger details for this booking!",
      });
    }

    // Booking Lifecycle Restriction: Cancelled or Cancellation_Requested bookings cannot be modified
    if (booking.status === "Cancellation_Requested" || booking.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot modify passenger manifest for a cancelled or pending-cancellation booking.",
      });
    }

    const { travellers } = req.body;
    if (!Array.isArray(travellers)) {
      return res.status(400).json({
        success: false,
        message: "Passenger manifest payload must be an array of traveller objects under key 'travellers'.",
      });
    }

    const expectedPersons = Number(booking.persons);
    if (travellers.length !== expectedPersons) {
      return res.status(400).json({
        success: false,
        message: `Passenger manifest count mismatch. Exactly ${expectedPersons} traveller(s) required for this booking, but received ${travellers.length}.`,
      });
    }

    // Validate and sanitize each traveller record before database modifications
    const sanitizedTravellers = [];
    const validGenders = ["Male", "Female", "Other"];
    const validIdTypes = ["Passport", "National_ID", "Driving_License"];

    for (let i = 0; i < travellers.length; i++) {
      const t = travellers[i];
      const pNum = i + 1; // Server-authoritative passengerNumber

      if (!t || typeof t !== "object") {
        return res.status(400).json({
          success: false,
          message: `Passenger #${pNum} data is invalid or missing.`,
        });
      }

      const fullName = t.fullName ? String(t.fullName).trim() : "";
      if (!fullName) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${pNum}: Full name is required.`,
        });
      }

      const ageNum = Number(t.age);
      if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${pNum}: Age must be a valid integer between 0 and 120.`,
        });
      }

      const gender = t.gender ? String(t.gender).trim() : "";
      if (!validGenders.includes(gender)) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${pNum}: Invalid gender '${gender}'. Must be one of: ${validGenders.join(", ")}.`,
        });
      }

      const idType = t.idType ? String(t.idType).trim() : "Passport";
      if (!validIdTypes.includes(idType)) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${pNum}: Invalid ID type '${idType}'. Must be one of: ${validIdTypes.join(", ")}.`,
        });
      }

      const idNumber = t.idNumber ? String(t.idNumber).trim() : "";
      if (!idNumber) {
        return res.status(400).json({
          success: false,
          message: `Passenger #${pNum}: Identification document number is required.`,
        });
      }

      let finalIdNumber = idNumber;
      if (idNumber.includes("*")) {
        const existingTraveller = await Traveller.findOne({
          bookingId: booking._id,
          passengerNumber: pNum,
        });
        if (existingTraveller && existingTraveller.idNumber) {
          finalIdNumber = existingTraveller.idNumber;
        } else {
          return res.status(400).json({
            success: false,
            message: `Passenger #${pNum}: Please provide a valid ID number instead of masked placeholders.`,
          });
        }
      }

      // Mass-assignment protection: strict field extraction
      sanitizedTravellers.push({
        bookingId: booking._id,
        userId: booking.buyer, // Server-authoritative user ownership
        passengerNumber: pNum, // Server-generated passenger number
        fullName,
        age: ageNum,
        gender,
        idType,
        idNumber: finalIdNumber,
        emergencyContactName: t.emergencyContactName ? String(t.emergencyContactName).trim() : "",
        emergencyContactPhone: t.emergencyContactPhone ? String(t.emergencyContactPhone).trim() : "",
        specialRequests: t.specialRequests ? String(t.specialRequests).trim() : "",
      });
    }

    // Persist/Upsert passenger records matching (bookingId, passengerNumber)
    const persistedTravellers = [];
    for (const tData of sanitizedTravellers) {
      const updatedTraveller = await Traveller.findOneAndUpdate(
        {
          bookingId: booking._id,
          passengerNumber: tData.passengerNumber,
        },
        {
          $set: tData,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );
      persistedTravellers.push(updatedTraveller);
    }

    // Update Booking flag
    await Booking.findByIdAndUpdate(booking._id, {
      $set: { travellerManifestCompleted: true },
    });

    const responseTravellers = persistedTravellers.map((t) => ({
      _id: t._id,
      passengerNumber: t.passengerNumber,
      fullName: t.fullName,
      age: t.age,
      gender: t.gender,
      idType: t.idType,
      idNumber: isAdminUser ? t.idNumber : maskIdNumber(t.idNumber),
      emergencyContactName: t.emergencyContactName,
      emergencyContactPhone: t.emergencyContactPhone,
      specialRequests: t.specialRequests,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Passenger manifest submitted successfully!",
      bookingId: booking._id,
      persons: expectedPersons,
      travellerManifestCompleted: true,
      travellerCount: responseTravellers.length,
      travellers: responseTravellers,
    });
  } catch (error) {
    next(error);
  }
};

// Customer — Get Passenger Manifest for a Booking
export const getBookingManifest = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format!",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    const isAdminUser =
      req.user &&
      (req.user.user_role === 1 || req.user.userType === "admin" || req.user.isAdmin);
    const isBuyer = String(booking.buyer) === String(req.user._id);

    if (!isAdminUser && !isBuyer) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view passenger details for this booking!",
      });
    }

    const travellers = await Traveller.find({ bookingId: booking._id }).sort({ passengerNumber: 1 });

    const formattedTravellers = travellers.map((t) => ({
      _id: t._id,
      passengerNumber: t.passengerNumber,
      fullName: t.fullName,
      age: t.age,
      gender: t.gender,
      idType: t.idType,
      idNumber: isAdminUser ? t.idNumber : maskIdNumber(t.idNumber),
      emergencyContactName: t.emergencyContactName,
      emergencyContactPhone: t.emergencyContactPhone,
      specialRequests: t.specialRequests,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      bookingId: booking._id,
      persons: booking.persons,
      travellerManifestCompleted: Boolean(booking.travellerManifestCompleted),
      travellerCount: formattedTravellers.length,
      travellers: formattedTravellers,
    });
  } catch (error) {
    next(error);
  }
};

// Admin — Get Full Passenger Manifest for a Booking (Unmasked Sensitive ID Numbers)
export const getAdminBookingManifest = async (req, res, next) => {
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

    const { bookingId } = req.params;

    if (!isValidObjectId(bookingId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking ID format!",
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("packageDetails", "packageName packageDestination packageDays packageNights")
      .populate("buyer", "username email phone");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found!",
      });
    }

    const travellers = await Traveller.find({ bookingId: booking._id }).sort({ passengerNumber: 1 });

    const formattedTravellers = travellers.map((t) => ({
      _id: t._id,
      passengerNumber: t.passengerNumber,
      fullName: t.fullName,
      age: t.age,
      gender: t.gender,
      idType: t.idType,
      idNumber: t.idNumber,
      emergencyContactName: t.emergencyContactName || "",
      emergencyContactPhone: t.emergencyContactPhone || "",
      specialRequests: t.specialRequests || "",
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      booking: {
        _id: booking._id,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        date: booking.date,
        persons: booking.persons,
        totalPrice: booking.totalPrice,
        travellerManifestCompleted: Boolean(booking.travellerManifestCompleted),
        packageName: booking.packageDetails?.packageName || "N/A",
        packageDestination: booking.packageDetails?.packageDestination || "N/A",
        buyerUsername: booking.buyer?.username || "N/A",
        buyerEmail: booking.buyer?.email || "N/A",
        buyerPhone: booking.buyer?.phone || "N/A",
      },
      travellerCount: formattedTravellers.length,
      travellers: formattedTravellers,
    });
  } catch (error) {
    next(error);
  }
};

// Admin — Get All Booking Manifests Overview with Server-Side Filtering & Search
export const getAdminAllManifests = async (req, res, next) => {
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
    const statusFilter = req.query.status || ""; // "completed" | "incomplete"
    const safeSearch = escapeRegex(String(rawSearch));

    const bookingQuery = {};
    if (statusFilter === "completed") {
      bookingQuery.travellerManifestCompleted = true;
    } else if (statusFilter === "incomplete") {
      bookingQuery.travellerManifestCompleted = { $ne: true };
    }

    const bookings = await Booking.find(bookingQuery)
      .populate("packageDetails", "packageName packageDestination")
      .populate("buyer", "username email phone")
      .sort({ createdAt: -1 });

    const filteredBookings = bookings.filter((b) => {
      if (!rawSearch) return true;
      const username = b.buyer?.username || "";
      const email = b.buyer?.email || "";
      const pkgName = b.packageDetails?.packageName || "";
      const searchRegex = new RegExp(safeSearch, "i");
      return searchRegex.test(username) || searchRegex.test(email) || searchRegex.test(pkgName);
    });

    const manifestSummaries = await Promise.all(
      filteredBookings.map(async (b) => {
        const count = await Traveller.countDocuments({ bookingId: b._id });
        return {
          _id: b._id,
          status: b.status,
          paymentStatus: b.paymentStatus,
          date: b.date,
          persons: b.persons,
          totalPrice: b.totalPrice,
          travellerManifestCompleted: Boolean(b.travellerManifestCompleted),
          travellerCount: count,
          packageName: b.packageDetails?.packageName || "Tour Package",
          packageDestination: b.packageDetails?.packageDestination || "",
          buyerUsername: b.buyer?.username || "N/A",
          buyerEmail: b.buyer?.email || "N/A",
          createdAt: b.createdAt,
        };
      })
    );

    const completedCount = manifestSummaries.filter((m) => m.travellerManifestCompleted).length;
    const incompleteCount = manifestSummaries.length - completedCount;

    return res.status(200).json({
      success: true,
      metrics: {
        totalBookingsCount: manifestSummaries.length,
        completedCount,
        incompleteCount,
      },
      manifests: manifestSummaries,
    });
  } catch (error) {
    next(error);
  }
};

import Booking from "../models/Booking.js";
import Traveller from "../models/Traveller.js";
import { escapeRegex, isValidObjectId } from "../utils/security.js";

/**
 * Helper function to mask sensitive ID numbers for customer responses
 */
export const maskIdNumber = (idStr) => {
  if (!idStr || typeof idStr !== "string") return "****";
  const trimmed = idStr.trim();
  if (trimmed.length <= 4) return "****";
  const prefix = trimmed.slice(0, 4);
  const suffix = trimmed.slice(-2);
  const maskedMiddle = "*".repeat(Math.max(2, trimmed.length - 6));
  return `${prefix}${maskedMiddle}${suffix}`;
};

/**
 * Traveller Domain Service
 * Handles passenger manifest submission, validation, masked ID preservation,
 * IDOR ownership rules, customer/admin manifest views, and admin overview reporting.
 */

/**
 * 1. Customer/Admin — Submit or Update Complete Passenger Manifest for a Booking
 */
export const submitBookingManifest = async ({ bookingId, travellers, user }) => {
  if (!isValidObjectId(bookingId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid booking ID format!",
    };
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return {
      success: false,
      statusCode: 404,
      message: "Booking not found!",
    };
  }

  // Authorization: Only the buyer or an admin can submit/update traveller details
  const isAdminUser =
    user && (user.user_role === 1 || user.userType === "admin" || user.isAdmin);
  const isBuyer = String(booking.buyer) === String(user?._id);

  if (!isAdminUser && !isBuyer) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not authorized to submit passenger details for this booking!",
    };
  }

  // Booking Lifecycle Restriction: Cancelled or Cancellation_Requested bookings cannot be modified
  if (booking.status === "Cancellation_Requested" || booking.status === "Cancelled") {
    return {
      success: false,
      statusCode: 400,
      message: "Cannot modify passenger manifest for a cancelled or pending-cancellation booking.",
    };
  }

  if (!Array.isArray(travellers)) {
    return {
      success: false,
      statusCode: 400,
      message: "Passenger manifest payload must be an array of traveller objects under key 'travellers'.",
    };
  }

  const expectedPersons = Number(booking.persons);
  if (travellers.length !== expectedPersons) {
    return {
      success: false,
      statusCode: 400,
      message: `Passenger manifest count mismatch. Exactly ${expectedPersons} traveller(s) required for this booking, but received ${travellers.length}.`,
    };
  }

  // Validate and sanitize each traveller record before database modifications
  const sanitizedTravellers = [];
  const validGenders = ["Male", "Female", "Other"];
  const validIdTypes = ["Passport", "National_ID", "Driving_License"];

  for (let i = 0; i < travellers.length; i++) {
    const t = travellers[i];
    const pNum = i + 1; // Server-authoritative passengerNumber

    if (!t || typeof t !== "object") {
      return {
        success: false,
        statusCode: 400,
        message: `Passenger #${pNum} data is invalid or missing.`,
      };
    }

    const fullName = t.fullName ? String(t.fullName).trim() : "";
    if (!fullName) {
      return {
        success: false,
        statusCode: 400,
        message: `Passenger #${pNum}: Full name is required.`,
      };
    }

    const ageNum = Number(t.age);
    if (isNaN(ageNum) || !Number.isInteger(ageNum) || ageNum < 0 || ageNum > 120) {
      return {
        success: false,
        statusCode: 400,
        message: `Passenger #${pNum}: Age must be a valid integer between 0 and 120.`,
      };
    }

    const gender = t.gender ? String(t.gender).trim() : "";
    if (!validGenders.includes(gender)) {
      return {
        success: false,
        statusCode: 400,
        message: `Passenger #${pNum}: Invalid gender '${gender}'. Must be one of: ${validGenders.join(", ")}.`,
      };
    }

    const idType = t.idType ? String(t.idType).trim() : "Passport";
    if (!validIdTypes.includes(idType)) {
      return {
        success: false,
        statusCode: 400,
        message: `Passenger #${pNum}: Invalid ID type '${idType}'. Must be one of: ${validIdTypes.join(", ")}.`,
      };
    }

    const idNumber = t.idNumber ? String(t.idNumber).trim() : "";
    if (!idNumber) {
      return {
        success: false,
        statusCode: 400,
        message: `Passenger #${pNum}: Identification document number is required.`,
      };
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
        return {
          success: false,
          statusCode: 400,
          message: `Passenger #${pNum}: Please provide a valid ID number instead of masked placeholders.`,
        };
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

  return {
    success: true,
    statusCode: 200,
    message: "Passenger manifest submitted successfully!",
    bookingId: booking._id,
    persons: expectedPersons,
    travellerManifestCompleted: true,
    travellerCount: responseTravellers.length,
    travellers: responseTravellers,
  };
};

/**
 * 2. Customer — Get Passenger Manifest for a Booking
 */
export const getBookingManifest = async ({ bookingId, user }) => {
  if (!isValidObjectId(bookingId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid booking ID format!",
    };
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    return {
      success: false,
      statusCode: 404,
      message: "Booking not found!",
    };
  }

  const isAdminUser =
    user && (user.user_role === 1 || user.userType === "admin" || user.isAdmin);
  const isBuyer = String(booking.buyer) === String(user?._id);

  if (!isAdminUser && !isBuyer) {
    return {
      success: false,
      statusCode: 403,
      message: "You are not authorized to view passenger details for this booking!",
    };
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

  return {
    success: true,
    statusCode: 200,
    bookingId: booking._id,
    persons: booking.persons,
    travellerManifestCompleted: Boolean(booking.travellerManifestCompleted),
    travellerCount: formattedTravellers.length,
    travellers: formattedTravellers,
  };
};

/**
 * 3. Admin — Get Full Passenger Manifest for a Booking (Unmasked Sensitive ID Numbers)
 */
export const getAdminBookingManifest = async ({ bookingId, user }) => {
  if (!user || (user.user_role !== 1 && user.userType !== "admin" && !user.isAdmin)) {
    return {
      success: false,
      statusCode: 403,
      message: "Access denied. Admin privileges required.",
    };
  }

  if (!isValidObjectId(bookingId)) {
    return {
      success: false,
      statusCode: 400,
      message: "Invalid booking ID format!",
    };
  }

  const booking = await Booking.findById(bookingId)
    .populate("packageDetails", "packageName packageDestination packageDays packageNights")
    .populate("buyer", "username email phone");

  if (!booking) {
    return {
      success: false,
      statusCode: 404,
      message: "Booking not found!",
    };
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

  return {
    success: true,
    statusCode: 200,
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
  };
};

/**
 * 4. Admin — Get All Booking Manifests Overview with Server-Side Filtering & Search
 */
export const getAdminAllManifests = async ({ user, searchTerm = "", statusFilter = "" }) => {
  if (!user || (user.user_role !== 1 && user.userType !== "admin" && !user.isAdmin)) {
    return {
      success: false,
      statusCode: 403,
      message: "Access denied. Admin privileges required.",
    };
  }

  const safeSearch = escapeRegex(String(searchTerm));

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
    if (!searchTerm) return true;
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

  return {
    success: true,
    statusCode: 200,
    metrics: {
      totalBookingsCount: manifestSummaries.length,
      completedCount,
      incompleteCount,
    },
    manifests: manifestSummaries,
  };
};

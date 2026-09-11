import * as travellerService from "../services/travellerService.js";
import { maskIdNumber } from "../services/travellerService.js";

// Re-export maskIdNumber for backward compatibility
export { maskIdNumber };

/**
 * Traveller Controller (HTTP & Routing Layer)
 * Delegates all traveller domain operations to travellerService.
 */

// Customer — Submit or Update Complete Passenger Manifest for a Booking
export const submitBookingManifest = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { travellers } = req.body;

    const result = await travellerService.submitBookingManifest({
      bookingId,
      travellers,
      user: req.user,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// Customer — Get Passenger Manifest for a Booking
export const getBookingManifest = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const result = await travellerService.getBookingManifest({
      bookingId,
      user: req.user,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin — Get Full Passenger Manifest for a Booking (Unmasked Sensitive ID Numbers)
export const getAdminBookingManifest = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const result = await travellerService.getAdminBookingManifest({
      bookingId,
      user: req.user,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// Admin — Get All Booking Manifests Overview with Server-Side Filtering & Search
export const getAdminAllManifests = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const statusFilter = req.query.status || "";

    const result = await travellerService.getAdminAllManifests({
      user: req.user,
      searchTerm,
      statusFilter,
    });

    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

import * as bookingService from "../services/bookingService.js";

/**
 * Booking Controller (HTTP & Routing Layer)
 * Delegates all booking domain operations to bookingService.
 */

// book package (Legacy route - restricted to admin/disabled for direct user unpaid bookings)
export const bookPackage = async (req, res, next) => {
  try {
    const { packageDetails, totalPrice, persons, date } = req.body;
    const packageIdParam = req.params.packageId;

    const result = await bookingService.bookPackage({
      user: req.user,
      packageDetails,
      packageIdParam,
      totalPrice,
      persons,
      date,
    });

    const statusCode = result.statusCode || (result.success ? 201 : 400);
    delete result.statusCode;
    return res.status(statusCode).send(result);
  } catch (error) {
    next(error);
  }
};

// get current bookings for admin
export const getCurrentBookings = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const result = await bookingService.getCurrentBookings({ searchTerm });
    delete result.statusCode;
    return res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

// get all bookings admin
export const getAllBookings = async (req, res, next) => {
  try {
    const searchTerm = req.query.searchTerm || "";
    const result = await bookingService.getAllBookings({ searchTerm });
    delete result.statusCode;
    return res.status(200).send(result);
  } catch (error) {
    next(error);
  }
};

// get current bookings for user by id
export const getUserCurrentBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const searchTerm = req.query.searchTerm || "";
    const result = await bookingService.getUserCurrentBookings({
      userId: id,
      requestingUser: req.user,
      searchTerm,
    });
    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).send(result);
  } catch (error) {
    next(error);
  }
};

// get all bookings by user id
export const getAllUserBookings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const searchTerm = req.query.searchTerm || "";
    const result = await bookingService.getAllUserBookings({
      userId: id,
      requestingUser: req.user,
      searchTerm,
    });
    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).send(result);
  } catch (error) {
    next(error);
  }
};

// delete booking history
export const deleteBookingHistory = async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    const result = await bookingService.deleteBookingHistory({
      bookingId: id,
      userId,
      requestingUser: req.user,
    });
    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).send(result);
  } catch (error) {
    next(error);
  }
};

// cancel booking (Hardened & Integrated with Refund Architecture)
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await bookingService.cancelBooking({
      bookingId: id,
      user: req.user,
    });
    const statusCode = result.statusCode || (result.success ? 200 : 400);
    delete result.statusCode;
    return res.status(statusCode).json(result);
  } catch (error) {
    next(error);
  }
};

// Download Booking PDF Invoice
export const downloadBookingInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await bookingService.downloadBookingInvoice({
      bookingId: id,
      user: req.user,
    });

    if (!result.success) {
      return res.status(result.statusCode || 400).json({
        success: false,
        message: result.message,
      });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
    res.setHeader("Content-Length", result.pdfBuffer.length);

    return res.end(result.pdfBuffer);
  } catch (error) {
    next(error);
  }
};

import express from "express";
import { requireSignIn, isAdmin } from "../middlewares/authMiddleware.js";
import {
  submitBookingManifest,
  getBookingManifest,
  getAdminBookingManifest,
  getAdminAllManifests,
} from "../controllers/travellerController.js";

const router = express.Router();

// Admin Routes (MUST be defined before dynamic /:bookingId routes to prevent URL capture)
router.get("/admin/all-manifests", requireSignIn, isAdmin, getAdminAllManifests);
router.get("/admin/manifest/:bookingId", requireSignIn, isAdmin, getAdminBookingManifest);

// Customer Manifest Routes
router.post("/:bookingId/travellers", requireSignIn, submitBookingManifest);
router.get("/:bookingId/travellers", requireSignIn, getBookingManifest);

export default router;

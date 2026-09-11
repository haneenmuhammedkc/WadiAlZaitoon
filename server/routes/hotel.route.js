import express from "express";
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from "../controllers/hotel.controller.js";
import { requireSignIn, isAdmin, optionalSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes (with optional auth so adminView parameter works safely if token is provided)
router.get("/", optionalSignIn, getHotels);
router.get("/:id", optionalSignIn, getHotelById);

// Admin-only routes (strictly protected by JWT token verification + admin role check)
router.post("/", requireSignIn, isAdmin, createHotel);
router.put("/:id", requireSignIn, isAdmin, updateHotel);
router.delete("/:id", requireSignIn, isAdmin, deleteHotel);

export default router;

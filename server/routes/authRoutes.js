import express from "express";
import {
  logOutController,
  loginController,
  signupController,
  test,
} from "../controllers/authController.js";

const router = express.Router();

//test route
router.get("/test", test);

//signup route
router.post("/signup", signupController);

//login route
router.post("/login", loginController);

//logout route
router.get("/logout", logOutController);

export default router;

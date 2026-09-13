import express from "express";
import {
  deleteUserAccountAdmin,
  getAllUsers,
  updateUser,
  updateUserPassword,
} from "../controllers/userController.js";
import { isAdmin, requireSignIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

//user auth
router.get("/user-auth", requireSignIn, (req, res) => {
  const { password, ...rest } = req.user._doc || req.user;
  return res.status(200).send({
    success: true,
    check: true,
    user: rest,
  });
});

//admin auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  const { password, ...rest } = req.user._doc || req.user;
  return res.status(200).send({
    success: true,
    check: true,
    user: rest,
  });
});

//update user details
router.post("/update/:id", requireSignIn, updateUser);

//update user password
router.post("/update-password/:id", requireSignIn, updateUserPassword);

//get all users
router.get("/getAllUsers", requireSignIn, isAdmin, getAllUsers);

//admin delete user accounts
router.delete(
  "/delete-user/:id",
  requireSignIn,
  isAdmin,
  deleteUserAccountAdmin
);

export default router;

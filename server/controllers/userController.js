import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import { escapeRegex, isValidObjectId } from "../utils/security.js";

//update user details
export const updateUser = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format!",
      });
    }

    if (String(req.user._id) !== String(req.params.id)) {
      return res.status(403).send({
        success: false,
        message: "You can only update your own account!",
      });
    }

    const { username, email, address, phone } = req.body;

    const updateFields = {};
    if (username !== undefined) updateFields.username = String(username).trim();
    if (email !== undefined) updateFields.email = String(email).toLowerCase().trim();
    if (phone !== undefined) updateFields.phone = String(phone).trim();

    if (address !== undefined) {
      let addrObj = address;
      if (typeof addrObj === "string") {
        const trimmed = addrObj.trim();
        if (!trimmed || trimmed === "[object Object]") {
          addrObj = {};
        } else if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
          try {
            addrObj = JSON.parse(trimmed);
          } catch {
            addrObj = { streetAddress: trimmed };
          }
        } else {
          addrObj = { streetAddress: trimmed };
        }
      }

      if (!addrObj || typeof addrObj !== "object") {
        addrObj = {};
      }

      const rawStreet = addrObj.streetAddress ? String(addrObj.streetAddress).trim() : "";
      const streetAddress = rawStreet === "[object Object]" ? "" : rawStreet;
      const apartment = addrObj.apartment ? String(addrObj.apartment).trim() : "";
      const city = addrObj.city ? String(addrObj.city).trim() : "";
      const state = addrObj.state ? String(addrObj.state).trim() : "";
      const postalCode = addrObj.postalCode ? String(addrObj.postalCode).trim() : "";
      const country = addrObj.country ? String(addrObj.country).trim() : "";

      let customName = addrObj.customField?.name
        ? String(addrObj.customField.name).trim().slice(0, 50)
        : "";
      let customVal = addrObj.customField?.value
        ? String(addrObj.customField.value).trim().slice(0, 250)
        : "";

      // Normalize customField: only active if both name and value are present
      if (!customName || !customVal) {
        customName = "";
        customVal = "";
      }

      updateFields.address = {
        streetAddress,
        apartment,
        city,
        state,
        postalCode,
        country,
        customField: {
          name: customName,
          value: customVal,
        },
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

    const { password: pass, ...rest } = updatedUser._doc;

    res.status(200).send({
      success: true,
      message: "User Details Updated Successfully",
      user: rest,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).send({
        success: false,
        message: "Email already in use!",
      });
    }
    next(error);
  }
};



// update user password
export const updateUserPassword = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format!",
      });
    }

    if (String(req.user._id) !== String(req.params.id)) {
      return res.status(403).send({
        success: false,
        message: "You can only update your own password!",
      });
    }

    const oldPassword = req.body.oldpassword;
    const newPassword = req.body.newpassword;

    if (!oldPassword || !newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Old password and new password (min 6 chars) are required!",
      });
    }

    const validUser = await User.findById(req.params.id);
    if (!validUser) {
      return res.status(404).send({
        success: false,
        message: "User Not Found!",
      });
    }

    const validPassword = bcryptjs.compareSync(oldPassword, validUser.password);
    if (!validPassword) {
      return res.status(400).send({
        success: false,
        message: "Invalid old password",
      });
    }

    const updatedHashedPassword = bcryptjs.hashSync(newPassword, 10);
    await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          password: updatedHashedPassword,
        },
      },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Password Updated Successfully",
    });
  } catch (error) {
    next(error);
  }
};

//delete user
export const deleteUserAccount = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format!",
      });
    }

    if (String(req.user._id) !== String(req.params.id)) {
      return res.status(403).send({
        success: false,
        message: "You can only delete your account!",
      });
    }

    await User.findByIdAndDelete(req.params.id);
    res.clearCookie("X_TTMS_access_token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return res.status(200).send({
      success: true,
      message: "User account has been deleted!",
    });
  } catch (error) {
    next(error);
  }
};

//get all users admin
export const getAllUsers = async (req, res, next) => {
  try {
    const rawSearch = req.query.searchTerm || "";
    const safeSearch = escapeRegex(String(rawSearch));

    const users = await User.find({
      user_role: 0,
      $or: [
        { username: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { phone: { $regex: safeSearch, $options: "i" } },
      ],
    }).select("-password");

    if (users && users.length > 0) {
      return res.status(200).send(users);
    } else {
      return res.status(200).send({
        success: false,
        message: "No Users Yet!",
      });
    }
  } catch (error) {
    next(error);
  }
};

//delete user admin
export const deleteUserAccountAdmin = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).send({
        success: false,
        message: "Invalid user ID format!",
      });
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).send({
        success: false,
        message: "User not found!",
      });
    }

    return res.status(200).send({
      success: true,
      message: "User account has been deleted!",
    });
  } catch (error) {
    next(error);
  }
};

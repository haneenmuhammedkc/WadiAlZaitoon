import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const requireSignIn = async (req, res, next) => {
  try {
    let token = req?.cookies?.X_TTMS_access_token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized: Token not provided!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized: User not found!",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).send({
      success: false,
      message: "Unauthorized: Invalid or expired token!",
    });
  }
};

// Admin access middleware
export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized access",
      });
    }

    if (req.user.user_role === 1) {
      next();
    } else {
      return res.status(403).send({
        success: false,
        message: "Access denied. Admin privileges required.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Optional sign-in middleware — attaches req.user if valid token present, otherwise proceeds
export const optionalSignIn = async (req, res, next) => {
  try {
    let token = req?.cookies?.X_TTMS_access_token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

export default requireSignIn;
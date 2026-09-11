import User from "../models/User.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

//test controller
export const test = (req, res) => {
  return res.send("Hello From Test!");
};

//signup controller
export const signupController = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        success: false,
        message: "Please provide a valid email address!",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters long!",
      });
    }

    const userExists = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (userExists) {
      return res.status(409).send({
        success: false,
        message: "User already exists please login",
      });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({
      username: String(username).trim(),
      email: String(email).toLowerCase().trim(),
      password: hashedPassword,
      address: req.body.address ? String(req.body.address).trim() : "",
      phone: req.body.phone ? String(req.body.phone).trim() : "",
    });

    await newUser.save();

    return res.status(201).send({
      message: "User Created Successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

//login controller
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "All fields are required!",
      });
    }

    const validUser = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!validUser) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = await jwt.sign(
      { id: validUser._id },
      process.env.JWT_SECRET,
      {
        expiresIn: "4d",
      }
    );
    const { password: pass, ...rest } = validUser._doc; // deselecting password to send user

    const cookieOptions = {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 24 * 60 * 60 * 1000,
    };

    res
      .cookie("X_TTMS_access_token", token, cookieOptions)
      .status(200)
      .send({
        success: true,
        message: "Login Success",
        user: rest,
      });
  } catch (error) {
    next(error);
  }
};

export const logOutController = (req, res, next) => {
  try {
    res.clearCookie("X_TTMS_access_token", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).send({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

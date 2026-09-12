import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      streetAddress: {
        type: String,
        default: "",
      },
      apartment: {
        type: String,
        default: "",
      },
      city: {
        type: String,
        default: "",
      },
      state: {
        type: String,
        default: "",
      },
      postalCode: {
        type: String,
        default: "",
      },
      country: {
        type: String,
        default: "",
      },
      customField: {
        name: {
          type: String,
          default: "",
        },
        value: {
          type: String,
          default: "",
        },
      },
    },
    phone: {
      type: String,
      default: "",
    },
    user_role: {
      type: Number,
      default: 0,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

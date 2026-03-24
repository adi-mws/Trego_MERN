import mongoose from "mongoose"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
    },

    avatar: {
      type: String,
      default: "",
    },

    googleId: {
      type: String,
      default: null,
    },

    about: {
      type: String,
      default: "",
    },

    lastOnline: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, 
  }
)

export const User = mongoose.model("User", userSchema)
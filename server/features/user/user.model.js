import mongoose from "mongoose";

const userPrefrencesSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "light",
  },
  accentColor: {
    type: String,
    default: "#000000",
  },
})

const userProfileSchema = new mongoose.Schema({
  githubUrl: {
    type: String,
    default: "",
  },
  linkedinUrl: {
    type: String,
    default: "",
  },
  facebookUrl: {
    type: String,
    default: "",
  },
})

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

    avatar: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "",
    },
    profile: {
      type: userProfileSchema,
      default: () => ({}),
    },
    prefrences: {
      type: userPrefrencesSchema,
      default: () => ({}),
    },
    lastOnline: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
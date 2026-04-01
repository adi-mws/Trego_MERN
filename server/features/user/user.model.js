import mongoose from "mongoose";

const userPreferencesSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ["light", "dark", "system"],
    default: "system",
  },
  accentColor: {
    type: String,
    default: "#1976d2",
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
      default: () => ({
        githubUrl: "",
        linkedinUrl: "",
        facebookUrl: "",  
      }),
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({ theme: "light", accentColor: "#1976d2" }),
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
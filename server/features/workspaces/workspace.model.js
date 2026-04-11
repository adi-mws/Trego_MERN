import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    avatar: String,

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    about: String,

    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);







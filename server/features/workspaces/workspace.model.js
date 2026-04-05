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

    // optional denormalized refs (not required but useful)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkspaceMember",
      },
    ],

    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],

    invites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "WorkspaceInvite",
      },
    ],

    notifications: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Notification",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Workspace = mongoose.model("Workspace", workspaceSchema);







import mongoose from "mongoose";


const workspaceInviteSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    createdById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["LINK"],
      required: true,
    },

    role: {
      type: String,
      enum: ["ADMIN", "MEMBER", "CLIENT"],
      default: "MEMBER",
    },

    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    expiresAt: Date,

    inviteUsageLimit: {
      type: Number,
      default: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

workspaceInviteSchema.methods.isValidInvite = function () {
  if (!this.isActive) return false;

  if (this.expiresAt && new Date() > this.expiresAt) return false;

  if (
    this.inviteUsageLimit !== -1 &&
    this.usedCount >= this.inviteUsageLimit
  ) {
    return false;
  }

  return true;
};

workspaceInviteSchema.index({ workspaceId: 1, code: 1 });

export const WorkspaceInvite = mongoose.model(
  "WorkspaceInvite",
  workspaceInviteSchema
);
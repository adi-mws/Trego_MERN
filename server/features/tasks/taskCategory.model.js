import mongoose from "mongoose";

const taskCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    key: {
      type: String,
      required: true, // BUG, FEATURE, HOTFIX
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    description: String,

    isUrgent: {
      type: Boolean,
      default: false,
    },

    defaultPriority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const TaskCategory = mongoose.model(
  "TaskCategory",
  taskCategorySchema
);
import mongoose from "mongoose";

const workflowSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    description: String,

    version: { type: Number, default: 1 },
    originalWorkflowId: { type: mongoose.Schema.Types.ObjectId, ref: "WorkflowTemplate" },
    isEditable: { type: Boolean, default: true },

    categoryIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TaskCategory",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const WorkflowTemplate = mongoose.model(
  "WorkflowTemplate",
  workflowSchema
);
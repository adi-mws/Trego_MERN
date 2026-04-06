import mongoose from "mongoose";

const workflowTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    description: String,

    // Which categories use this workflow
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
  workflowTemplateSchema
);
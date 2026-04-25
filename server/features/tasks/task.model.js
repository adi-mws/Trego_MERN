import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Category (optional — task can be uncategorized)
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskCategory",
      default: null,
      index: true,
    },

    // Workflow tracking (optional — only when a workflow is assigned)
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      default: null,
    },

    currentStageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      default: null,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    deadline: Date,
    startDate: Date,
    endDate: Date,

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: String,

    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);

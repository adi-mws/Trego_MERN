import mongoose from "mongoose";

const workflowTransitionSchema = new mongoose.Schema(
  {
    workflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      required: true,
    },

    fromStage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      required: true,
    },

    toStage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      required: true,
    },

    action: {
      type: String,
      default: "",
    },

    label: {
      type: String,
    },

    allowedRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectRole",
      },
    ],

    requireComment: {
      type: Boolean,
      default: false,
    },

    meta: {
      color: String,
    },

    style: {
      strokeColor: String,
      strokeWidth: Number,
    }
  },
  { timestamps: true }
);

export const WorkflowTransition = mongoose.model(
  "WorkflowTransition",
  workflowTransitionSchema
);
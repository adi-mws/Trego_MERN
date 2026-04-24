import mongoose from "mongoose";

// Tracks every stage transition a task goes through
const taskStateHistorySchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
    index: true,
  },

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
    index: true,
  },

  fromStage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkflowStage",
    default: null, // null = task creation (placed on start stage)
  },

  toStage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkflowStage",
    required: true,
  },

  transitionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkflowTransition",
    default: null,
  },

  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  comment: String, // optional note at time of transition

  // For delay analysis — entry/exit timestamps
  enteredAt: { type: Date, default: Date.now },
  exitedAt: { type: Date, default: null },

  // Did this stage go over deadline?
  wasDelayed: { type: Boolean, default: false },
}, { timestamps: true });

export const TaskStateHistory = mongoose.model("TaskStateHistory", taskStateHistorySchema);

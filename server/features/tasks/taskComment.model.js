import mongoose from "mongoose";

const taskCommentSchema = new mongoose.Schema({
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

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  content: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["COMMENT", "TRANSITION", "BLOCK", "SUBTASK"],
    default: "COMMENT",
  },

  // Stage/transition context
  references: {
    transition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTransition",
    },
    fromStage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
    },
    toStage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  },
}, { timestamps: true });

export const TaskComment = mongoose.model("TaskComment", taskCommentSchema);
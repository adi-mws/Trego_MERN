import mongoose from "mongoose";

const taskStageAssigneeSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true,
    },

    workflowStageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      required: true,
      index: true,
    },

    projectMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectMember",
      required: true,
      index: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

taskStageAssigneeSchema.index(
  { taskId: 1, workflowStageId: 1, projectMemberId: 1 },
  { unique: true }
);

export const TaskStageAssignee = mongoose.model(
  "TaskStageAssignee",
  taskStageAssigneeSchema
);

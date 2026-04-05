const taskObjectiveSchema = new mongoose.Schema(
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
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: Date,

    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    position: Number,
  },
  { timestamps: true }
);

export const TaskObjective = mongoose.model(
  "TaskObjective",
  taskObjectiveSchema
);e
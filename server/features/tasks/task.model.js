const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    currentStageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskCategory",
      required: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    deadline: Date,

    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: String,

    eligibleRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectRole",
      },
    ],

    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
const taskSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    /* -------- Workflow -------- */
    currentStageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      required: true,
    },

    /* -------- Basic Info -------- */
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

    /* -------- Category -------- */
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TaskCategory",
      required: true,
    },

    /* -------- Priority -------- */
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    deadline: Date,

    /* -------- Blocking -------- */
    isBlocked: {
      type: Boolean,
      default: false,
    },

    blockedReason: String,

    /* -------- Role Eligibility -------- */
    eligibleRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectRole",
      },
    ],

    /* -------- Assignees -------- */
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    /* -------- Dependencies -------- */
    dependencies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],

    /* -------- Gantt -------- */
    startDate: Date,
    endDate: Date,
  },
  { timestamps: true }
);

export const Task = mongoose.model("Task", taskSchema);
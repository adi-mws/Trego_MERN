const taskCommentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  content: {
    type: String,
    required: true,
  },

  type: {
    type: String, // "COMMENT" | "TRANSITION"
    default: "COMMENT",
  },

  // 🔥 mentions / references
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
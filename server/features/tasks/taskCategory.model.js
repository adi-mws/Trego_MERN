const taskCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    key: { type: String, required: true },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    workflowTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      required: true,
    },

    description: String,

    defaultPriority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const workflowStageSchema = new mongoose.Schema({
  workflowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WorkflowTemplate",
    required: true,
    index: true,
  },

  name: { type: String, required: true },

  order: Number, // for linear fallback

  isStart: { type: Boolean, default: false },
  isEnd: { type: Boolean, default: false },

  allowedRoles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectRole",
    },
  ],

  // actions allowed
  actions: [
    {
      type: String, // e.g. "approve", "reject", "submit"
    },
  ],
}, { timestamps: true });


workflowStageSchema.index(
  { workflowId: 1, isStart: 1 },
  {
    unique: true,
    partialFilterExpression: { isStart: true },
  }
);

export const WorkflowStage = mongoose.model(
  "WorkflowStage",
  workflowStageSchema
);
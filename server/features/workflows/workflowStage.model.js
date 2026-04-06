const workflowStageSchema = new mongoose.Schema(
  {
    workflowTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      required: true,
      index: true,
    },

    name: { type: String, required: true },

    key: String,

    order: { type: Number, required: true },

    isInitial: { type: Boolean, default: false },
    isTerminal: { type: Boolean, default: false },

    //  Who can work in this stage
    allowedRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectRole",
      },
    ],

    color: String,
  },
  { timestamps: true }
);

export const WorkflowStage = mongoose.model(
  "WorkflowStage",
  workflowStageSchema
);
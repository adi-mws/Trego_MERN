const workflowTransitionSchema = new mongoose.Schema(
  {
    workflowTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      required: true,
      index: true,
    },

    fromStageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      default: null,
    },

    toStageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowStage",
      required: true,
    },

    name: String,

    // Who can perform transition
    allowedRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProjectRole",
      },
    ],

    // Conditions (flexible engine)
    conditions: [
      {
        field: String, // "isBlocked", "priority"
        operator: String, // "EQUAL", "NOT_NULL"
        value: mongoose.Schema.Types.Mixed,
      },
    ],

    // Validators
    validators: [
      {
        type: {
          type: String, // OBJECTIVE_COMPLETED, REQUIRED_FIELD
        },
        config: mongoose.Schema.Types.Mixed,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    isAuto: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const WorkflowTransition = mongoose.model(
  "WorkflowTransition",
  workflowTransitionSchema
);
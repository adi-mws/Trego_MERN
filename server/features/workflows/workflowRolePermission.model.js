const workflowRolePermissionSchema = new mongoose.Schema(
  {
    workflowTemplateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      required: true,
    },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectRole",
      required: true,
    },

    permissions: {
      canCreateTask: { type: Boolean, default: false },
      canEditTask: { type: Boolean, default: false },
      canDeleteTask: { type: Boolean, default: false },
      canChangeStage: { type: Boolean, default: false },
      canAssignTask: { type: Boolean, default: false },
      canEditObjective: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export const WorkflowRolePermission = mongoose.model(
  "WorkflowRolePermission",
  workflowRolePermissionSchema
);
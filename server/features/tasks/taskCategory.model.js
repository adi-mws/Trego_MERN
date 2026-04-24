import mongoose from "mongoose";

const taskCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "#1890ff",
    },

    defaultWorkflowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkflowTemplate",
      default: null,
    },
  },
  { timestamps: true }
);


taskCategorySchema.index(
  { name: 1, projectId: 1 },
  { unique: true }
);


taskCategorySchema.pre("save", async function () {
  if (this.name) {
    this.name = this.name.trim();
  }
});

export default mongoose.model("TaskCategory", taskCategorySchema);
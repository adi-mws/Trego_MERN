import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    toastMessage: {
      type: String,
      trim: true,
    },

    image: String,

    type: {
      type: String,
      enum: ["INFO", "ACTION", "ALERT", "SYSTEM"],
      required: true,
    },

    iconKey: {
      type: String,
      enum: ["INFO", "LOGIN", "LOGOUT", "TASK", "PROJECT", "WORKFLOW", "ALERT", "SYSTEM"],
      default: "INFO",
    },

    important: {
      type: Boolean,
      default: false,
    },

    triggeredByType: {
      type: String,
      enum: ["USER", "SYSTEM", "AGENT"],
      required: true,
    },

    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    scopeType: {
      type: String,
      enum: ["WORKSPACE", "ACCOUNT"],
      required: true,
    },

    scopeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    workspaceName: {
      type: String,
      trim: true,
      default: "",
    },

    workspaceSlug: {
      type: String,
      trim: true,
      default: "",
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },

    projectName: {
      type: String,
      trim: true,
      default: "",
    },

    projectSlug: {
      type: String,
      trim: true,
      default: "",
    },

    entityType: {
      type: String,
      enum: [
        "TASK",
        "PROJECT",
        "WORKSPACE",
        "ACCOUNT",
        "PROJECT_MEMBER",
        "LABEL",
        "SYSTEM",
        "SUBTASK",
        "WORKFLOW",
        null,
      ],
      default: null,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    link: String,

    sourceSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      default: null,
    },
  },
  { timestamps: true }
);

/* TTL (auto delete after 10 days) */
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 10 * 24 * 60 * 60 }
);

export default mongoose.model("Notification", notificationSchema);

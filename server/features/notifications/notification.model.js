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

    entityType: {
      type: String,
      enum: [
        "TASK",
        "PROJECT",
        "WORKSPACE",
        "ACCOUNT",
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
  },
  { timestamps: true }
);

/* TTL (auto delete after 10 days) */
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 10 * 24 * 60 * 60 }
);

export default mongoose.model("Notification", notificationSchema);
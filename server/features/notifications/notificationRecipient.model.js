import mongoose from "mongoose";

const notificationRecipientSchema = new mongoose.Schema(
  {
    notificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: Date,

    isCleared: {
      type: Boolean,
      default: false,
    },

    clearedAt: Date,
  },
  { timestamps: true }
);

/* Indexes (CRITICAL for performance) */
notificationRecipientSchema.index({ userId: 1, isRead: 1 });
notificationRecipientSchema.index({ userId: 1, sessionId: 1, isRead: 1 });
notificationRecipientSchema.index({ userId: 1, createdAt: -1 });
notificationRecipientSchema.index(
  { notificationId: 1, userId: 1, sessionId: 1 },
  { unique: true } // prevent duplicates
);
notificationRecipientSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 10 * 24 * 60 * 60 }
);

export default mongoose.model(
  "NotificationRecipient",
  notificationRecipientSchema
);

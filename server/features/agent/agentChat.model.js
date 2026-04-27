import mongoose from "mongoose";

const agentChatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    meta: {
      type: String,
      default: "",
    },
  },
  { timestamps: true, _id: true }
);

const agentChatSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New chat",
      trim: true,
    },
    scope: {
      type: String,
      enum: ["project", "workspace", "all-projects"],
      default: "workspace",
    },
    mode: {
      type: String,
      enum: ["ask", "inspect", "plan"],
      default: "ask",
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
    contexts: [
      {
        type: String,
      },
    ],
    messages: [agentChatMessageSchema],
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

agentChatSchema.index({ workspaceId: 1, userId: 1, updatedAt: -1 });

export const AgentChat = mongoose.model("AgentChat", agentChatSchema);

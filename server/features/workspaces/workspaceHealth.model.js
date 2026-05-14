import mongoose from "mongoose";

const workspaceHealthSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    snapshotDate: {
      type: Date,
      required: true,
      index: true,
    },

    overallHealthScore: {
      type: Number, // 0–100
      required: true,
    },

    healthStatus: {
      type: String,
      enum: ["HEALTHY", "WARNING", "CRITICAL"],
      required: true,
    },

    totalProjects: Number,
    activeProjects: Number,

    totalTasks: Number,
    completedTasks: Number,

    taskCompletionRate: Number,

    overdueTaskCount: Number,
    blockedTaskCount: Number,

    totalMembers: Number,
    activeMembers: Number,
  },
  {
    timestamps: true,
  }
);

workspaceHealthSchema.index(
  { workspaceId: 1, snapshotDate: 1 },
  { unique: true }
);

export const WorkspaceHealth = mongoose.model(
  "WorkspaceHealth",
  workspaceHealthSchema
);
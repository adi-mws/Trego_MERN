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

    taskCompletionRate: Number, // %

    overdueTaskCount: Number,
    blockedTaskCount: Number,

    avgTaskCompletionTimeSeconds: Number,

    velocity: Number, 

    totalMembers: Number,
    activeMembers: Number,

    memberLoadScore: Number, // 0–1 (from burnout profiles)

    inactiveMembersCount: Number,

    riskFlags: [
      {
        type: String,
        enum: [
          "deadline_risk",
          "member_overload",
          "low_velocity",
          "high_blocked_tasks",
          "inactive_team",
        ],
      },
    ],

    aiSummary: String,

    computedByAI: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* Prevent duplicate snapshot per day */
workspaceHealthSchema.index(
  { workspaceId: 1, snapshotDate: 1 },
  { unique: true }
);

export const WorkspaceHealth = mongoose.model(
  "WorkspaceHealth",
  workspaceHealthSchema
);
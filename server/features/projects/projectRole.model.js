import mongoose from "mongoose";

const projectRoleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true,
        index: true,
    },

    permissions: {
        canManageProject: { type: Boolean, default: false },
        canManageMembers: { type: Boolean, default: false },
        canInviteMembers: { type: Boolean, default: false },

        canCreateTask: { type: Boolean, default: true },
        canEditTask: { type: Boolean, default: true },
        canDeleteTask: { type: Boolean, default: false },

        canViewActivity: { type: Boolean, default: true },
    },

    priority: {
        type: Number,
        default: 0,
    },
},
    {
        timestamps: true,
    }
);

// prevent duplicate role names per project
projectRoleSchema.index({ project: 1, name: 1 }, { unique: true });

export const ProjectRole = mongoose.model("ProjectRole", projectRoleSchema);
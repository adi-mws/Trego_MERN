import mongoose from "mongoose";
import { Workspace } from "./workspace.model.js";
import { WorkspaceMember } from "./workspaceMember.model.js";
import { WorkspaceInvite } from "./workspaceInvite.model.js";
import { WorkspaceHealth } from "./workspaceHealth.model.js";

/* ================= CREATE ================= */

export const createWorkspace = async (data) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace = await Workspace.create([data], { session });

    const workspaceId = workspace[0]._id;

    // create owner as member
    const ownerMember = await WorkspaceMember.create(
      [
        {
          workspaceId,
          userId: data.ownerId,
          role: "OWNER",
        },
      ],
      { session }
    );

    // push into workspace.members
    await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        $push: {
          members: ownerMember[0]._id,
        },
      },
      { session }
    );

    // initial health snapshot
    await WorkspaceHealth.create(
      [
        {
          workspaceId,
          snapshotDate: new Date(),
          overallHealthScore: 100,
          healthStatus: "HEALTHY",
          totalProjects: 0,
          activeProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          taskCompletionRate: 0,
          overdueTaskCount: 0,
          blockedTaskCount: 0,
          totalMembers: 1,
          activeMembers: 1,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return workspace[0];
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

/* ================= GET ================= */

export const getWorkspaceById = async (workspaceId) => {
  return await Workspace.findById(workspaceId)
    .populate("ownerId", "name email")
    .populate({
      path: "members",
      populate: {
        path: "userId",
        select: "name email",
      },
    })
    .populate("projects")
    .populate("invites");
};



export const getWorkspaceBySlug = async (slug) => {
  return await Workspace.findOne({ slug });
};

export const getUserWorkspaces = async (userId) => {
  // better than only owner → includes member workspaces
  const memberships = await WorkspaceMember.find({ userId });

  const workspaceIds = memberships.map((m) => m.workspaceId);

  return await Workspace.find({
    _id: { $in: workspaceIds },
  });
};

/* ================= UPDATE ================= */

export const updateWorkspace = async (workspaceId, data) => {
  return await Workspace.findByIdAndUpdate(workspaceId, data, {
    new: true,
  });
};

/* ================= DELETE (CRITICAL) ================= */

export const deleteWorkspace = async (workspaceId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // delete main workspace
    await Workspace.findByIdAndDelete(workspaceId, { session });

    // cascade delete
    await WorkspaceMember.deleteMany({ workspaceId }, { session });
    await WorkspaceInvite.deleteMany({ workspaceId }, { session });
    await WorkspaceHealth.deleteMany({ workspaceId }, { session });

    // NOTE:
    // also delete:
    // - projects
    // - tasks
    // - notifications
    // if implemented

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};


export const getWorkspacesInfinite = async ({
  userId,
  cursor,
  limit = 10,
}) => {
  const query = {};

  // cursor-based pagination
  if (cursor) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  // get workspaceIds where user is member
  const memberships = await WorkspaceMember.find({ userId }).select(
    "workspaceId"
  );

  const workspaceIds = memberships.map((m) => m.workspaceId);

  query._id = {
    ...(query._id || {}),
    $in: workspaceIds,
  };

  const workspaces = await Workspace.find(query)
    .sort({ _id: -1 }) // latest first
    .limit(limit)
    .lean();

  // enrich data
  const enriched = await Promise.all(
    workspaces.map(async (ws) => {
      // latest health
      const health = await WorkspaceHealth.findOne({
        workspaceId: ws._id,
      })
        .sort({ snapshotDate: -1 })
        .select("overallHealthScore")
        .lean();

      // members preview (limit 5)
      const members = await WorkspaceMember.find({
        workspaceId: ws._id,
      })
        .limit(5)
        .populate("userId", "name pfp")
        .lean();

      const formattedMembers = members.map((m) => ({
        _id: m.userId?._id,
        name: m.userId?.name,
        avatar: m.userId?.pfp,
      }));

      // total members count
      const totalMembers = await WorkspaceMember.countDocuments({
        workspaceId: ws._id,
      });

      return {
        _id: ws._id,
        name: ws.name,
        createdAt: ws.createdAt,
        healthScore: health?.overallHealthScore || 0,
        totalMembers,
        members: formattedMembers,
      };
    })
  );

  // next cursor
  const nextCursor =
    workspaces.length > 0
      ? workspaces[workspaces.length - 1]._id
      : null;

  return {
    data: enriched,
    nextCursor,
    hasMore: workspaces.length === limit,
  };
};
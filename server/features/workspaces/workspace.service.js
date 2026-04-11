import mongoose from "mongoose";
import { Workspace } from "./workspace.model.js";
import { WorkspaceMember } from "./workspaceMember.model.js";
import { WorkspaceInvite } from "./workspaceInvite.model.js";
import { WorkspaceHealth } from "./workspaceHealth.model.js";
import { Project } from "../projects/project.model.js";
import crypto from "crypto";

export const createWorkspace = async (data) => {
  let workspace;

  try {
    workspace = await Workspace.create(data);

    const ownerMember = await WorkspaceMember.create({
      workspaceId: workspace._id,
      userId: data.ownerId,
      role: "OWNER",
    });

    await Workspace.findByIdAndUpdate(workspace._id, {
      $push: { members: ownerMember._id },
    });

    await WorkspaceHealth.create({
      workspaceId: workspace._id,
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
    });

    return workspace;
  } catch (err) {
    if (workspace?._id) {
      await Workspace.findByIdAndDelete(workspace._id);
    }
    throw err;
  }
};



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
  }).lean();
};


export const getWorkspaceGlobalState = async (workspaceSlug) => {
  const workspace = await Workspace.findOne({ slug: workspaceSlug })
    .populate({
      path: "members",
      populate: {
        path: "userId",
        select: "name avatar email",
      },
    })
    .populate("projects")
    .lean();

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const members = (workspace.members || []).map((m) => ({
    _id: m.userId?._id,
    name: m.userId?.name,
    avatar: m.userId?.avatar,
    email: m.userId?.email,
  }));


  return {
    ...workspace,
    members,
    totalMembers: members.length,
  };
};


/*  UPDATE  */
export const updateWorkspace = async (workspaceId, data) => {
  return await Workspace.findByIdAndUpdate(workspaceId, data, {
    new: true,
  });
};


/*  DELETE (CRITICAL)  */
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

    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};


// Workspace Infinite Scroll with Cursor Pagination
export const getWorkspacesInfinite = async ({
  userId,
  cursor,
  limit = 10,
}) => {
  try {
    /* VALIDATION */

    if (!userId) {
      throw new Error("UserId is required");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    /* GET WORKSPACE IDS */

    const workspaceIds = await WorkspaceMember.distinct("workspaceId", {
      userId: userObjectId,
    });

    if (!workspaceIds.length) {
      return {
        workspaces: [],
        nextCursor: null,
        hasMore: false,
      };
    }

    /* BUILD QUERY */

    const query = {
      _id: { $in: workspaceIds },
    };

    if (cursor) {
      query._id.$lt = new mongoose.Types.ObjectId(cursor);
    }

    /* FETCH WORKSPACES */

    const workspaces = await Workspace.find(query)
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    if (!workspaces.length) {
      return {
        workspaces: [],
        nextCursor: null,
        hasMore: false,
      };
    }

    const workspaceIdList = workspaces.map((ws) => ws._id);

    /* FETCH RELATED DATA */

    const [healths, memberCounts, members] = await Promise.all([
      // latest health per workspace
      WorkspaceHealth.aggregate([
        { $match: { workspaceId: { $in: workspaceIdList } } },
        { $sort: { snapshotDate: -1 } },
        {
          $group: {
            _id: "$workspaceId",
            overallHealthScore: { $first: "$overallHealthScore" },
          },
        },
      ]),

      // total members count
      WorkspaceMember.aggregate([
        { $match: { workspaceId: { $in: workspaceIdList } } },
        {
          $group: {
            _id: "$workspaceId",
            count: { $sum: 1 },
          },
        },
      ]),

      // member preview
      WorkspaceMember.find({
        workspaceId: { $in: workspaceIdList },
      })
        .populate("userId", "name avatar")
        .lean(),
    ]);

    /* MAP DATA */

    const healthMap = {};
    healths.forEach((h) => {
      healthMap[h._id.toString()] = h.overallHealthScore;
    });

    const memberCountMap = {};
    memberCounts.forEach((m) => {
      memberCountMap[m._id.toString()] = m.count;
    });

    const memberMap = {};
    members.forEach((m) => {
      const key = m.workspaceId.toString();

      if (!memberMap[key]) memberMap[key] = [];

      if (memberMap[key].length < 5) {
        memberMap[key].push({
          _id: m.userId?._id,
          name: m.userId?.name,
          avatar: m.userId?.avatar,
        });
      }
    });

    /* FINAL RESPONSE */

    const data = workspaces.map((ws) => ({
      _id: ws._id,
      slug: ws.slug,
      name: ws.name,
      createdAt: ws.createdAt,
      healthScore: healthMap[ws._id.toString()] || 0,
      totalMembers: memberCountMap[ws._id.toString()] || 0,
      members: memberMap[ws._id.toString()] || [],
    }));

    const nextCursor =
      workspaces.length === limit
        ? workspaces[workspaces.length - 1]._id
        : null;

    return {
      workspaces: data,
      nextCursor,
      hasMore: workspaces.length === limit,
    };
  } catch (err) {
    console.error("getWorkspacesInfinite error:", err);
    throw err;
  }
};


export const checkWorkspaceMembership = async ({
  workspaceId,
  userId,
}) => {
  if (!workspaceId || !userId) return false;

  const membership = await WorkspaceMember.exists({
    workspaceId,
    userId,
  });

  return !!membership;
};






// * Workspace Invite

export const generateWorkspaceInvite = async ({
  workspaceId,
  createdById,
  role = "MEMBER",
  expiryHours = 24,
  maxUses = 1,
}) => {
  const code = crypto.randomBytes(16).toString("hex");

  const expiresAt = expiryHours
    ? new Date(Date.now() + expiryHours * 60 * 60 * 1000)
    : null;

  const inviteUsageLimit = maxUses === -1 ? -1 : Number(maxUses);

  await WorkspaceInvite.create({
    workspaceId,
    createdById,
    type: "LINK",
    role,
    code,
    expiresAt,
    inviteUsageLimit,
  });

  const link = `${process.env.CLIENT_URL}/join/workspace/${code}`;

  return { link };
};


export const joinWorkspaceByInvite = async ({ code, userId }) => {
  // find invite
  const invite = await WorkspaceInvite.findOne({ code });

  if (!invite) {
    throw new Error("Invalid invite link");
  }

  // validate using schema method
  if (!invite.isValidInvite()) {
    throw new Error("Invite is expired, inactive, or limit reached");
  }

  // get workspace
  const workspace = await Workspace.findById(invite.workspaceId).populate("members", "role userId");

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // check if already member
  const alreadyMember = workspace.members.some((m) => {
    const id = m.userId?._id || m.userId;
    return id.toString() === userId.toString();
  });

  if (!alreadyMember) {
    workspace.members.push({
      userId,
      role: invite.role,
    })

    await workspace.save();

  }
  else {
    throw new Error("User is already a member of this workspace");
  }


  // increment usage
  invite.usedCount += 1;

  // auto deactivate if limit reached
  if (
    invite.inviteUsageLimit !== -1 &&
    invite.usedCount >= invite.inviteUsageLimit
  ) {
    invite.isActive = false;
  }

  await invite.save();

  return {
    workspaceId: workspace._id,
    workspaceSlug: workspace.slug,
  }
};
import mongoose from "mongoose";
import { Workspace } from "./workspace.model.js";
import { WorkspaceMember } from "./workspaceMember.model.js";
import { WorkspaceInvite } from "./workspaceInvite.model.js";
import { WorkspaceHealth } from "./workspaceHealth.model.js";
import { Project } from "../projects/project.model.js";
import crypto from "crypto";
import { User } from "../user/user.model.js";

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


export const getWorkspaceGlobalState = async (workspaceSlug, userId) => {
  // 1. Get workspace
  const workspace = await Workspace.findOne({ slug: workspaceSlug }).lean();

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // 2. Get all members
  const memberDocs = await WorkspaceMember.find({
    workspaceId: workspace._id,
  })
    .populate("userId", "name avatar email")
    .lean();

  const members = memberDocs.map((m) => ({
    _id: m.userId?._id,
    name: m.userId?.name,
    avatar: m.userId?.avatar,
    email: m.userId?.email,
    role: m.role,
    joinedAt: m.joinedAt,
  }));

  // 3. Get current user's role
  let currentUserRole = null;

  if (userId) {
    const currentMember = memberDocs.find(
      (m) => m.userId?._id?.toString() === userId.toString()
    );

    currentUserRole = currentMember?.role || null;
  }

  // 4. Get projects
  const projects = await Project.find({
    workspaceId: workspace._id,
  }).lean();

  // 5. Return combined state
  return {
    ...workspace,
    members,
    totalMembers: members.length,
    currentUserRole,
    projects,
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
  // Find invite
  const invite = await WorkspaceInvite.findOne({ code });

  if (!invite) {
    throw new Error("Invalid invite link");
  }

  // Validate invite
  if (!invite.isValidInvite()) {
    throw new Error("Invite is expired, inactive, or usage limit reached");
  }

  // Get workspace
  const workspace = await Workspace.findById(invite.workspaceId).select("_id slug");

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Check if user is already a member
  const existingMember = await WorkspaceMember.findOne({
    workspaceId: invite.workspaceId,
    userId,
  });

  if (existingMember) {
    throw new Error("User is already a member of this workspace");
  }

  // Create new workspace member
  await WorkspaceMember.create({
    workspaceId: invite.workspaceId,
    userId,
    role: invite.role,
  });

  // Increment invite usage
  invite.usedCount += 1;

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
  };
};








export const getWorkspaceMemberProfile = async ({
  userId,        // target user
  workspaceId,   // current workspace
  viewerId       // logged-in user
}) => {
  if (!userId || !workspaceId || !viewerId) {
    throw new Error("userId, workspaceId and viewerId are required");
  }

  // 1. User
  const user = await User.findById(userId)
    .select("name email avatar about profile lastOnline")
    .lean();

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Membership in current workspace
  const membership = await WorkspaceMember.findOne({
    userId,
    workspaceId,
  })
    .select("role joinedAt")
    .lean();

  if (!membership) {
    throw new Error("User is not a member of this workspace");
  }

  // 3. Get all workspaceIds of target user
  const targetMemberships = await WorkspaceMember.find({ userId })
    .select("workspaceId")
    .lean();

  const targetWorkspaceIds = targetMemberships.map((m) =>
    m.workspaceId.toString()
  );

  // 4. Get all workspaceIds of viewer
  const viewerMemberships = await WorkspaceMember.find({ userId: viewerId })
    .select("workspaceId")
    .lean();

  const viewerWorkspaceIds = new Set(
    viewerMemberships.map((m) => m.workspaceId.toString())
  );

  // 5. Intersection (TRUE mutual)
  const mutualIds = targetWorkspaceIds.filter((id) =>
    viewerWorkspaceIds.has(id)
  );

  // 6. Fetch mutual workspaces (limit 5)
  const mutualWorkspaces = await Workspace.find({
    _id: { $in: mutualIds },
  })
    .select("name avatar")
    .limit(5)
    .lean();

  // 7. Response
  return {
    name: user.name,
    email: user.email,
    avatar: user.avatar,

    role: membership.role,
    joinedAt: membership.joinedAt,

    about: user.about,

    githubUrl: user.profile?.githubUrl || "",
    linkedinUrl: user.profile?.linkedinUrl || "",
    facebookUrl: user.profile?.facebookUrl || "",

    lastOnline: user.lastOnline,

    mutualWorkspaces,
  };
};





/**
 * Get workspace member stats + list
 */
export const getWorkspaceMembersSummary = async (workspaceId) => {
  // Aggregate counts by role
  const stats = await WorkspaceMember.aggregate([
    {
      $match: {
        workspaceId: new mongoose.Types.ObjectId(workspaceId),
      },
    },
    {
      $group: {
        _id: "$role",
        count: { $sum: 1 },
      },
    },
  ]);

  // Convert stats → easy object
  const summary = {
    OWNER: 0,
    ADMIN: 0,
    MEMBER: 0,
    CLIENT: 0,
  };

  stats.forEach((item) => {
    summary[item._id] = item.count;
  });

  // Get all members with user info
  const members = await WorkspaceMember.find({ workspaceId })
    .populate("userId", "name email pfp")
    .sort({ createdAt: -1 });

  return {
    counts: {
      owners: summary.OWNER,
      admins: summary.ADMIN,
      members: summary.MEMBER,
      clients: summary.CLIENT,
      total:
        summary.OWNER +
        summary.ADMIN +
        summary.MEMBER +
        summary.CLIENT,
    },
    members,
  };
};


export const getWorkspaceMembersByRole = async (workspaceId, role) => {
  const match = {
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  };

  // apply role filter only if provided
  if (role) {
    match.role = role.toUpperCase();
  }

  const members = await WorkspaceMember.find(match)
    .populate("userId", "_id name email avatar")
    .select("role userId")
    .lean();

  return members.map((m) => ({
    _id: m.userId?._id,
    memberId: m._id,
    name: m.userId?.name,
    email: m.userId?.email,
    avatar: m.userId?.avatar,
    role: m.role,
  }));
};



/**
 * Update role / transfer ownership
 */
export const updateWorkspaceMemberRole = async ({
  workspaceId,
  currentUserId,
  memberId,       // ✅ changed
  newRole,
}) => {
  // 🔹 Get current user membership
  const currentUser = await WorkspaceMember.findOne({
    workspaceId,
    userId: currentUserId,
  });

  if (!currentUser) {
    throw new Error("You are not a member of this workspace");
  }

  // 🔹 Only ADMIN / OWNER allowed
  if (!["ADMIN", "OWNER"].includes(currentUser.role)) {
    throw new Error("Unauthorized action");
  }

  // 🔹 Get target membership by memberId
  const targetMember = await WorkspaceMember.findOne({
    _id: memberId,
    workspaceId, // extra safety
  });

  if (!targetMember) {
    throw new Error("Target member not found");
  }

  const currentRole = currentUser.role;
  const targetRole = targetMember.role;

  // 🚫 Prevent self-role changes (recommended)
  if (targetMember.userId.toString() === currentUserId.toString()) {
    throw new Error("You cannot change your own role");
  }

  // =========================
  // 🔒 ADMIN RULES
  // =========================
  if (currentRole === "ADMIN") {
    if (targetRole === "OWNER") {
      throw new Error("Admin cannot modify owner");
    }

    if (newRole === "OWNER") {
      throw new Error("Admin cannot assign owner");
    }
  }

  // =========================
  // 👑 OWNER RULES
  // =========================
  if (currentRole === "OWNER") {
    // 🔁 Transfer ownership
    if (newRole === "OWNER") {
      if (targetRole !== "ADMIN") {
        throw new Error("Only admin can be promoted to owner");
      }

      // current owner → ADMIN
      await WorkspaceMember.updateOne(
        { workspaceId, userId: currentUserId },
        { role: "ADMIN" }
      );

      // target → OWNER
      await WorkspaceMember.updateOne(
        { _id: memberId },
        { role: "OWNER" }
      );

      return {
        message: "Ownership transferred successfully",
      };
    }
  }

  // =========================
  // 🔄 NORMAL ROLE UPDATE
  // =========================
  const validRoles = ["CLIENT", "MEMBER", "ADMIN"];

  if (!validRoles.includes(newRole)) {
    throw new Error("Invalid role");
  }

  // 🚫 Cannot modify OWNER directly
  if (targetRole === "OWNER") {
    throw new Error("Cannot modify owner directly");
  }

  await WorkspaceMember.updateOne(
    { _id: memberId },
    { role: newRole }
  );

  return {
    message: "Role updated successfully",
  };
};
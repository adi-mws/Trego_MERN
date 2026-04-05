import { Session } from "./session.model.js";

export const getUserSessionsSafe = async (
  userId,
  { type = "ALL", currentDeviceId = null } = {}
) => {
  if (!userId) throw new Error("User ID is required");

  const sessions = await Session.find({ userId })
    .populate("accountId", "provider") 
    .sort({ lastActiveAt: -1 })
    .lean();

  const now = new Date();

  let filtered = sessions.map((s) => {
    const isExpired = s.expiresAt < now;

    return {
      id: s._id,
      deviceId: s.deviceId,

      browser: s.browser,
      os: s.os,
      ipAddress: s.ipAddress,

      provider: s.accountId?.provider || "UNKNOWN",

      status: s.status,
      isExpired,

      loggedInAt: s.loggedInAt,
      lastActiveAt: s.lastActiveAt,
      expiresAt: s.expiresAt,

      isCurrent: currentDeviceId
        ? s.deviceId === currentDeviceId
        : false,
    };
  });


  switch (type) {
    case "ACTIVE":
      filtered = filtered.filter(
        (s) => s.status === "ACTIVE" && !s.isExpired
      );
      break;

    case "EXPIRED":
      filtered = filtered.filter((s) => s.isExpired);
      break;

    case "REVOKED":
      filtered = filtered.filter((s) => s.status === "REVOKED");
      break;

    case "ALL":
    default:
      break;
  }

  return filtered;
};
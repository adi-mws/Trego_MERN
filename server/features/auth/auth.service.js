// auth/auth.service.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Account } from "../auth/account.model.js";
import { OAuth2Client } from "google-auth-library";
import { User } from "../user/user.model.js";
import { Session } from "../session/session.model.js";
import { createSessionActivityNotification } from "../notifications/notification.service.js";
import { emitToUserExceptSession } from "../../socket/index.js";

async function getOtherSessionIds(userId, sessionId, { includeRevoked = false } = {}) {
  const query = {
    userId,
    _id: { $ne: sessionId },
  };

  if (!includeRevoked) {
    query.status = "ACTIVE";
  }

  const sessions = await Session.find(query).select("_id").lean();
  return sessions.map((session) => session._id);
}

function toSessionPayload(session, { provider = "UNKNOWN" } = {}) {
  if (!session) return null;

  const expiresAt = session.expiresAt ? new Date(session.expiresAt) : null;

  return {
    id: String(session._id || session.id || ""),
    deviceId: session.deviceId,
    browser: session.browser,
    os: session.os,
    ipAddress: session.ipAddress,
    provider,
    status: session.status,
    isExpired: expiresAt ? expiresAt < new Date() : false,
    loggedInAt: session.loggedInAt,
    lastActiveAt: session.lastActiveAt,
    expiresAt: session.expiresAt,
    isCurrent: false,
  };
}

function toPlainUser(userDoc) {
  if (!userDoc) return null;
  return typeof userDoc.toObject === "function" ? userDoc.toObject() : userDoc;
}

export const signInLocally = async ({
  email,
  password,
  deviceInfo,
}) => {
  // Find account
  const account = await Account.findOne({
    provider: "LOCAL",
    providerAccountId: email,
  });

  if (!account || !account.password) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, account.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const user = await User.findById(account.userId);
  if (!user) {
    throw new Error("User not found");
  }

  // Create session
  const session = await Session.create({
    userId: account.userId,
    accountId: account._id,
    deviceId: deviceInfo.deviceId,

    ipAddress: deviceInfo.ip,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    userAgent: deviceInfo.userAgent,

    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Create JWT
  const token = jwt.sign(
    {
      userId: account.userId,
      sessionId: session._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

  const sessionPayload = toSessionPayload(session, { provider: account.provider });
  const recipientSessionIds = await getOtherSessionIds(account.userId, session._id);
  if (recipientSessionIds.length > 0) {
    emitToUserExceptSession(account.userId, session._id, "auth:session-added", {
      session: sessionPayload,
      sourceSessionId: String(session._id),
      userId: String(account.userId),
    });
  }

  if (recipientSessionIds.length > 0) {
    await createSessionActivityNotification({
      userId: user._id,
      sourceSessionId: session._id,
      recipientSessionIds,
      action: "LOGIN",
      deviceInfo,
    }).catch((err) => {
      console.warn("Failed to create login notification:", err.message);
    });
  }

  return {
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      about: user.about,
      lastOnline: user.lastOnline,
      currentSessionId: session._id,
    }
  };
};


// SignUp (Registration as well as login )
export const signUpLocally = async ({
  name,
  email,
  password,
}) => {
  // Check if LOCAL account already exists
  const existingAccount = await Account.findOne({
    provider: "LOCAL",
    providerAccountId: email,
  });

  if (existingAccount) {
    throw new Error("Account already exists. Please sign in.");
  }

  // Check if user exists (Google signup case)
  let user = await User.findOne({ email });

  if (!user) {
    // Create new user
    user = await User.create({
      name,
      email,
    });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 5. Create LOCAL account
  const account = await Account.create({
    userId: user._id,
    provider: "LOCAL",
    providerAccountId: email,
    password: hashedPassword,
  });

  return { user };
};


const googleClient = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

async function getGoogleProfileFromIdToken(idToken) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
  };
}

async function getGoogleProfileFromCode(code) {
  const { tokens } = await googleClient.getToken(code);
  googleClient.setCredentials(tokens);

  if (tokens?.id_token) {
    return getGoogleProfileFromIdToken(tokens.id_token);
  }

  const response = await googleClient.request({
    url: "https://www.googleapis.com/oauth2/v2/userinfo",
  });

  const profile = response.data || {};

  return {
    googleId: profile.id || profile.sub,
    email: profile.email,
    name: profile.name,
    avatar: profile.picture,
  };
}

export const signInWithGoogle = async ({
  idToken,
  code,
  deviceInfo,
}) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("Google client ID is not configured");
  }

  const googleProfile = code
    ? await getGoogleProfileFromCode(code)
    : await getGoogleProfileFromIdToken(idToken);

  const googleId = googleProfile.googleId;
  const email = googleProfile.email;
  const name = googleProfile.name;
  const avatar = googleProfile.avatar;

  // 2. Check if account exists
  let account = await Account.findOne({
    provider: "GOOGLE",
    providerAccountId: googleId,
  });

  let user;

  if (account) {
    user = await User.findById(account.userId);
  } else {
    // Check if user already exists (email match)
    user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        avatar,
      });
    } else if (avatar && !String(user.avatar || "").trim()) {
      user.avatar = avatar;
      await user.save();
    }

    // Create account
    account = await Account.create({
      userId: user._id,
      provider: "GOOGLE",
      providerAccountId: googleId,
    });
  }

  if (!user) {
    throw new Error("User not found");
  }

  let needsSave = false;

  if (avatar && !String(user.avatar || "").trim()) {
    user.avatar = avatar;
    needsSave = true;
  }

  if (name && !String(user.name || "").trim()) {
    user.name = name;
    needsSave = true;
  }

  if (needsSave) {
    await user.save();
  }

  // Create session
  const session = await Session.create({
    userId: user._id,
    accountId: account._id,
    deviceId: deviceInfo.deviceId,

    ipAddress: deviceInfo.ip,
    browser: deviceInfo.browser,
    os: deviceInfo.os,
    userAgent: deviceInfo.userAgent,

    status: "ACTIVE",
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // 7. Generate JWT
  const token = jwt.sign(
    {
      userId: user._id,
      sessionId: session._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const sessionPayload = toSessionPayload(session, { provider: "GOOGLE" });
  const recipientSessionIds = await getOtherSessionIds(user._id, session._id);
  if (recipientSessionIds.length > 0) {
    emitToUserExceptSession(user._id, session._id, "auth:session-added", {
      session: sessionPayload,
      sourceSessionId: String(session._id),
      userId: String(user._id),
    });
  }

  if (recipientSessionIds.length > 0) {
    await createSessionActivityNotification({
      userId: user._id,
      sourceSessionId: session._id,
      recipientSessionIds,
      action: "LOGIN",
      deviceInfo,
    }).catch((err) => {
      console.warn("Failed to create google login notification:", err.message);
    });
  }

  const userData = toPlainUser(user);

  return {
    token,
    data: {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      avatar: userData.avatar,
      lastOnline: userData.lastOnline,
      currentSessionId: session._id,
    },
  };
};


// services/auth.service.js


/**
 * Logout current session
 */
export const signOutSession = async ({ sessionId, userId, deviceInfo }) => {
  const session = await Session.findById(sessionId);

  if (!session) return;

  await Session.deleteOne({ _id: sessionId });

  emitToUserExceptSession(userId, sessionId, "auth:session-removed", {
    removedSessionIds: [String(sessionId)],
    sourceSessionId: sessionId,
    userId: String(userId),
  });

  const recipientSessionIds = await getOtherSessionIds(userId, sessionId);
  if (recipientSessionIds.length > 0) {
    await createSessionActivityNotification({
      userId,
      sourceSessionId: sessionId,
      recipientSessionIds,
      action: "LOGOUT",
      deviceInfo,
    }).catch((err) => {
      console.warn("Failed to create logout notification:", err.message);
    });
  }
};

/**
 * Logout specific session (admin/device UI)
 */
export const signOutSpecificSession = async (sessionId, userId, sourceSessionId = null) => {
  const session = await Session.findOne({
    _id: sessionId,
    userId,
  });

  if (!session) {
    throw new Error("Session not found");
  }

  await Session.deleteOne({ _id: sessionId, userId });

  emitToUserExceptSession(userId, sourceSessionId || sessionId, "auth:session-removed", {
    removedSessionIds: [String(session._id)],
    sourceSessionId: sourceSessionId || sessionId,
    userId: String(userId),
  });

  const recipientSessionIds = await getOtherSessionIds(userId, session._id, { includeRevoked: true });
  if (recipientSessionIds.length > 0) {
    await createSessionActivityNotification({
      userId,
      sourceSessionId: session._id,
      recipientSessionIds,
      action: "LOGOUT",
      deviceInfo: session,
    }).catch((err) => {
      console.warn("Failed to create device logout notification:", err.message);
    });
  }
};

/**
 * Logout all sessions
 */
export const signOutAllSession = async ({ userId, sessionId, deviceInfo }) => {
  const activeSessions = await Session.find({ userId, status: "ACTIVE" }).select("_id").lean();
  const removedSessionIds = activeSessions.map((session) => String(session._id));
  const recipientSessionIds = activeSessions
    .map((session) => session._id)
    .filter((id) => String(id) !== String(sessionId));

  await Session.deleteMany({ userId, status: "ACTIVE" });

  emitToUserExceptSession(userId, sessionId, "auth:session-removed", {
    removedSessionIds,
    sourceSessionId: sessionId,
    userId: String(userId),
  });

  if (recipientSessionIds.length > 0) {
    await createSessionActivityNotification({
      userId,
      sourceSessionId: sessionId,
      recipientSessionIds,
      action: "LOGOUT",
      deviceInfo,
    }).catch((err) => {
      console.warn("Failed to create logout-all notification:", err.message);
    });
  }
};



export const verifyAuthData = async (userId, sessionId = null) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    about: user.about,
    lastOnline: user.lastOnline,
    currentSessionId: sessionId,
  }
}

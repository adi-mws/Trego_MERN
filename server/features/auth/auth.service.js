// auth/auth.service.js

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Account } from "../auth/account.model.js";
import { OAuth2Client } from "google-auth-library";
import { User } from "../user/user.model.js";
import { Session } from "../session/session.model.js";

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

  return {
    token,
    data: {
      name: account.userId.name,
      email: account.userId.email,
      avatar: account.userId.avatar,
      about: account.userId.about,
      lastOnline: account.userId.lastOnline
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


// Login with Google 
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const signInWithGoogle = async ({
  idToken,
  deviceInfo,
}) => {
  // Verify token with Google
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name;
  const avatar = payload.picture;

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
    }

    // Create account
    account = await Account.create({
      userId: user._id,
      provider: "GOOGLE",
      providerAccountId: googleId,
    });
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

  return { token, data: { name: user.name, email: user.email, avatar: user.avatar, lastOnline: user.lastOnline } };
};


// services/auth.service.js


/**
 * Logout current session
 */
export const signOutSession = async (sessionId) => {
  const session = await Session.findById(sessionId);

  if (!session) return;

  session.status = "REVOKED";
  await session.save();
};

/**
 * Logout specific session (admin/device UI)
 */
export const signOutSpecificSession = async (sessionId, userId) => {
  const session = await Session.findOne({
    _id: sessionId,
    userId,
  });

  if (!session) {
    throw new Error("Session not found");
  }

  session.status = "REVOKED";
  await session.save();
};

/**
 * Logout all sessions
 */
export const signOutAllSession = async (userId) => {
  await Session.updateMany(
    { userId, status: "ACTIVE" },
    { status: "REVOKED" }
  );
};



export const verifyAuthData = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    about: user.about,
    lastOnline: user.lastOnline
  }
}
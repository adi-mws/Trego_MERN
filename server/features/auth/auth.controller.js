import { signInLocally, signUpLocally } from "./auth.service.js";
import { signInWithGoogle } from "./auth.service.js";


// export const sendVerififcationData = async (req, res) => {
//     try {
//         if (!req.auth) {
//             return res.status(401).json({ message: "Unauthorised: Auth not found" });
//         }
//         return res.status(200).json({message: "Auth Verified", role: req.auth.role, data: req.auth.data})
//     }
//     catch (error) {
//         return res.status(500).json({ message: "Internal Server error", error: error });
//     }
// }

// controllers/auth.controller.js


export const signInController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const deviceInfo = {
      deviceId: req.headers["x-device-id"] || "unknown",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      browser: "unknown", // optional parser later
      os: "unknown",
    };

    const { token } = await signInLocally({
      email,
      password,
      deviceInfo,
    });

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.json({
      success: true,
      message: "Logged in successfully",
    });
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

export const signUpController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const deviceInfo = {
      deviceId: req.headers["x-device-id"] || "unknown",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      browser: "unknown",
      os: "unknown",
    };

    const { token, user } = await signUpLocally({
      name,
      email,
      password,
      deviceInfo,
    });

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

// googleLogin 
export const signInGoogleController = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Missing Google token",
      });
    }

    const deviceInfo = {
      deviceId: req.headers["x-device-id"] || "unknown",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      browser: "unknown",
      os: "unknown",
    };

    const { token, user } = await signInWithGoogle({
      idToken,
      deviceInfo,
    });

    // Set cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("Google login error:", err);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};




// controllers/auth.controller.js

import {
  signOutSession,
  signOutSpecificSession,
  signOutAllSession,
} from "../services/auth.service.js";

/**
 * 🔐 Sign out current session
 */
export const signOut = async (req, res) => {
  try {
    const { sessionId } = req.user;

    await signOutSession(sessionId);

    // clear cookie
    res.clearCookie("accessToken");

    return res.json({
      success: true,
      message: "Signed out successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * Sign out specific session (device)
 */
export const signOutDevice = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    await signOutSpecificSession(sessionId, userId);

    return res.json({
      success: true,
      message: "Device signed out successfully",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * 🔥 Sign out from all sessions
 */
export const signOutAll = async (req, res) => {
  try {
    const { userId } = req.user;

    await signOutAllSession(userId);

    // clear cookie for current device
    res.clearCookie("accessToken");

    return res.json({
      success: true,
      message: "Signed out from all devices",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
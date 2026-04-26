import {
  signInWithGoogle, signInLocally, signUpLocally, signOutSession,
  signOutSpecificSession,
  signOutAllSession,
  verifyAuthData,
} from "./auth.service.js";

function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
}


export const signInController = async (req, res) => {
  try {
    const { email, password, deviceInfo } = req.body;
    console.log(email, password, deviceInfo)
    const { token, data } = await signInLocally({
      email,
      password,
      deviceInfo,
    });

    // Set cookie
    res.cookie("token", token, getAuthCookieOptions());

    return res.json({
      success: true,
      data: data,
      message: "Signed in successfully",
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

    const { user } = await signUpLocally({
      name,
      email,
      password,
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

    const { token, data } = await signInWithGoogle({
      idToken,
      deviceInfo,
    });

    // Set cookie
    res.cookie("token", token, getAuthCookieOptions());

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Google login error:", err);

    return res.status(401).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};






/**
 *  Sign out current session
 */
export const signOut = async (req, res) => {
  try {
    const { sessionId, userId } = req.user;

    await signOutSession({
      sessionId,
      userId,
      deviceInfo: req.session,
    });

    // clear cookie
    res.clearCookie("token", getAuthCookieOptions());

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
 * Sign out from all sessions
 */
export const signOutAll = async (req, res, next) => {
  try {
    const { userId, sessionId } = req.user;

    await signOutAllSession({
      userId,
      sessionId,
      deviceInfo: req.session,
    });

    // clear cookie for current device
    res.clearCookie("token", getAuthCookieOptions());

    return res.json({
      success: true,
      message: "Signed out from all devices",
    });
  } catch (err) {
    next(err);
  }
};

 // auth Verify controller
export const authVerifyController = async (req, res, next) => {
  try {
    if (!req.user || !req.user?.userId) {
      return res.status(401).json({ sucess: false, message: "Unauthorized, User not found" });
    }
    const data = await verifyAuthData(req.user?.userId, req.user?.sessionId);
    return res.status(200).json({ success: true, message: "Verified successfully", data: data });
  }
  catch (error) {
    next(error);
  }
}

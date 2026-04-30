import { User } from "./user.model.js";
import { profileCompleteVerification } from "../../utils/user.utils.js"
import { getUserSessionsSafe } from "../session/session.service.js";
import { emitToUserExceptSession } from "../../socket/index.js";

function toPlainUser(userDoc) {
  if (!userDoc) return null;
  return typeof userDoc.toObject === "function" ? userDoc.toObject() : userDoc;
}

export const getUserGlobalData = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const currentDeviceId = req.deviceId; 

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let sessions = await getUserSessionsSafe(userId, {type: "ACTIVE"});

    // Mark current session
    if (currentDeviceId) {
      sessions = sessions.map((s) => ({
        ...s,
        isCurrent: s.deviceId === currentDeviceId,
      }));
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        currentSessionId: req.user?.sessionId,
        isProfileCompleted: profileCompleteVerification(user),
        sessions,
      },
    });

  } catch (error) {
    next(error);
  }
};
// update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      name,
      about,
      githubUrl,
      linkedinUrl,
      facebookUrl,
    } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (about !== undefined) updateData.about = about;

    if (req.file) {

      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    if (githubUrl !== undefined)
      updateData["profile.githubUrl"] = githubUrl;

    if (linkedinUrl !== undefined)
      updateData["profile.linkedinUrl"] = linkedinUrl;

    if (facebookUrl !== undefined)
      updateData["profile.facebookUrl"] = facebookUrl;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    const payload = toPlainUser(updatedUser);

    emitToUserExceptSession(userId, req.user?.sessionId, "user:updated", {
      user: payload,
      sourceSessionId: req.user?.sessionId,
    });

    return res.status(200).json({
      success: true,
      data: payload,
    });

  } catch (error) {
    next(error);
  }
};


// for thee theme and accent color update
export const updatePreferences = async (req, res, next) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { theme, accentColor, importantNotificationsOnly } = req.body;

    const updateData = {};

    if (theme !== undefined)
      updateData["preferences.theme"] = theme;

    if (accentColor !== undefined)
      updateData["preferences.accentColor"] = accentColor;

    if (importantNotificationsOnly !== undefined)
      updateData["preferences.importantNotificationsOnly"] = Boolean(importantNotificationsOnly);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-__v");

    const payload = toPlainUser(user);

    emitToUserExceptSession(userId, req.user?.sessionId, "user:updated", {
      user: payload,
      sourceSessionId: req.user?.sessionId,
    });

    res.status(200).json({
      success: true,
      data: payload,
    });

  } catch (error) {
    next(error);
  }
};

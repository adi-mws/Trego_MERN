
import jwt from "jsonwebtoken";
import { Session } from "../features/session/session.model.js";
import { User } from "../features/user/user.model.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token",
      });
    }

    // 2. Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { userId, sessionId } = decoded;

    if (!userId || !sessionId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session not found",
      });
    }

    // Check status
    if (session.status !== "ACTIVE") {
      return res.status(401).json({
        success: false,
        message: "Session not active",
      });
    }

    if (session.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      userId,
      sessionId,
    };

    req.session = session;

    next();
  } catch (err) {
    console.error("Auth error:", err);

    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

export default authMiddleware;
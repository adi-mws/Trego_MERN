import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";

/**
 * Optional auth middleware for Users & Admins
 * @param {Object} options
 * @param {("admin"|"user")|("admin"|"user")[]} [options.role] - main role(s) required if token present
 * @param {string[]} [options.subRole] - only checked if role includes "admin"
 */
export const authenticateOptional = ({ role, subRole = [] } = {}) => {
  const rolesArray = role ? (Array.isArray(role) ? role : [role]) : [];

  return async (req, res, next) => {
    try {
      const token = req.cookies?.token;

      // If no token → treat as guest
      if (!token) return next();

      // Try decoding token
      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        // Invalid token → ignore, proceed as guest
        return next();
      }

      const { role: decodedRole, data } = decoded;

      // Attach auth info
      req.auth = { role: decodedRole, data };

      // Role check if roles are specified
      if (rolesArray.length && !rolesArray.includes(decodedRole)) {
        return res.status(403).json({ message: "Forbidden: Role mismatch" });
      }

      // Only validate session and DB if token exists
      const session = await Session.findById(data?.sessionId);
      if (!session) return res.status(401).json({ message: "Unauthorized: Invalid session" });

      if (decodedRole === "admin") {
        const admin = await Admin.findById(data._id).lean();
        if (!admin) return res.status(401).json({ message: "Unauthorized: Admin not found" });

        if (subRole.length) {
          const adminRole = data?.adminRole || admin.adminRole;
          if (!subRole.includes(adminRole)) {
            return res.status(403).json({ message: "Forbidden: Admin subRole not allowed" });
          }
        }
      }

      if (decodedRole === "user") {
        const user = await User.findById(data._id).lean();
        if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });
      }

      next();
    } catch (err) {
      console.error(err);
      // Guest-safe: any unexpected error → proceed as guest
      next();
    }
  };
};

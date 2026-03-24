import jwt from "jsonwebtoken";
import Session from "../models/Session.js";
import Admin from "../models/Admin.js";
import User from "../models/User.js";
// import { hashToken } from "../utils/hashToken.js";

/**
 * Auth middleware for Users & Admins
 * @param {Object} options
 * @param {("admin"|"user")|("admin"|"user")[]} [options.role] - main role(s) required
 * @param {string[]} [options.subRole] - only checked if role includes "admin"
 */
export const ensureAuth = ({ role, subRole = [] } = {}) => {
  // Normalize role to array
  const rolesArray = role ? (Array.isArray(role) ? role : [role]) : [];
  return async (req, res, next) => {
    try {
      // Only get token from cookie
      const token = req.cookies?.token;
      if (!token) return res.status(401).json({ message: "Unauthorized: No token" });
    
      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Attaching req.auth for the global visiblity in the server
      req.auth = {
        role: decoded.role, 
        data: decoded.data
      };
      const { role: decodedRole, data } = decoded;
      
      // console.log("JWT DECODED = " + data._id, decodedRole, data)
      // Role check
      if (rolesArray.length && !rolesArray.includes(decodedRole)) {
        return res.status(403).json({ message: "Forbidden: Role mismatch" });
      }

      // Validate session
      const session = await Session.findById(data?.sessionId);
      // console.log("Session = ", session)
      if (!session) return res.status(401).json({ message: "Unauthorized: Invalid session" });

      // Admin subRole check
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

      // User check
      if (decodedRole === "user") {
        const user = await User.findById(data._id).lean();
        if (!user) return res.status(401).json({ message: "Unauthorized: User not found" });
      }
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  };
};

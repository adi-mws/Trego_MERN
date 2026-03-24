// middlewares/socketAuth.js
import cookie from "cookie";
import jwt from "jsonwebtoken";

/**
 * Non-blocking socket auth middleware.
 * - If token missing -> attach guest auth and allow connection
 * - If token present & valid -> attach decoded payload (socket.auth)
 * - If token present but invalid -> treat as guest (do NOT reject)
 */
export default function authenticateSocket(socket, next) {
  try {

    const rawCookies = socket.handshake.headers?.cookie || "";
    const cookies = cookie.parse(rawCookies || "");
    const token = cookies.token;

    // No token -> guest
    if (!token) {
      socket.auth = { role: "guest" };
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded token payload (NOT full DB model)
    // Expect decoded to include: { role, data... }
    socket.auth = {
      role: decoded.role, // all the objects whether it is request object or it is socket object
      data: decoded.data  // they all will follow the same pattern storing the auth values
    };
    return next();
  } catch (err) {
    // Token invalid or verify error -> log and fallback to guest
    console.warn("Socket auth verify failed:", err.message);
    socket.auth = { role: "guest" };
    return next();
  }
}

// socket/index.js

import { Server } from "socket.io";
import authenticateSocket from "../middlewares/socketAuth.js";
import { socketStore } from "./store.js";
import { checkWorkspaceMembership } from "../features/workspaces/workspace.service.js";
let io = null;

export function initSocket(server) {
  const devOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
  ].filter(Boolean);

  io = new Server(server, {
    cors: {
      origin: devOrigins,
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    const userId = socket.auth?.userId || socket.auth?.data?._id;
    const sessionId = socket.auth?.sessionId || socket.auth?.data?.sessionId;

    if (!userId || !sessionId) {
      console.log(" Invalid socket auth, keeping socket idle");
      return;
    }

    //  REGISTER USER
    socketStore.addUser(userId, sessionId, socket.id);

    // Join USER room (notifications)
    socket.join(`user:${userId}`);

    console.log(
      ` User connected: ${userId} (session: ${sessionId}) (socket: ${socket.id})`
    );

    //  WORKSPACE JOIN (LAZY + SECURE)
    socket.on("workspace:join", async (workspaceId) => {
      try {
        if (!workspaceId) return;

        const isMember = await checkWorkspaceMembership(userId, workspaceId);

        if (!isMember) {
          return socket.emit("workspace:error", {
            message: "Unauthorized workspace access",
            workspaceId,
          });
        }

        socket.join(`workspace:${workspaceId}`);

        socket.emit("workspace:joined", { workspaceId });

        console.log(`${userId} joined workspace ${workspaceId}`);
      } catch (err) {
        console.error("workspace:join error:", err);
      }
    });

    //  WORKSPACE LEAVE
    socket.on("workspace:leave", (workspaceId) => {
      if (!workspaceId) return;

      socket.leave(`workspace:${workspaceId}`);

      socket.emit("workspace:left", { workspaceId });

      console.log(`${userId} left workspace ${workspaceId}`);
    });

    // HEARTBEAT (optional)
    socket.on("heartbeat:ack", () => {
      // optional: track last active timestamp
    });

    // DISCONNECT
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);

      socketStore.removeSocket(socket.id);
    });
  });

  return io;
}

// HELPERS

export function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

//  EMIT HELPERS

/**
 *  Notifications / personal events
 */
export function emitToUser(userId, event, payload) {
  if (!io) return;

  io.to(`user:${String(userId || "")}`).emit(event, payload);
}

/**
 * Workspace real-time events
 */
export function emitToWorkspace(workspaceId, event, payload) {
  if (!io) return;

  io.to(`workspace:${String(workspaceId || "")}`).emit(event, payload);
}

/**
 * Exclude current session (security / special events)
 */
export function emitToUserExceptSession(userId, sessionId, event, payload) {
  if (!io) return;

  const normalizedUserId = String(userId || "");
  const normalizedSessionId = String(sessionId || "");
  const sessions = socketStore.getUserSessions(normalizedUserId);
  const currentSockets = sessions.get(normalizedSessionId) || new Set();

  const allSockets = socketStore.getUserAllSockets(normalizedUserId);

  for (const socketId of allSockets) {
    if (currentSockets.has(socketId)) continue;

    io.to(socketId).emit(event, payload);
  }
}

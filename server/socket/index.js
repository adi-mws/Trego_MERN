// socket/index.js
import { Server } from "socket.io";
import authenticateSocket from "../middlewares/socketAuth.js";
import { socketStore } from "./store.js";

let io = null;

export function initSocket(server, options = {}) {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    const role = socket.auth?.role;
    const data = socket.auth?.data;

    /* -------------------------------------------------------------
       INITIAL ROLE ASSIGNMENT
    -------------------------------------------------------------- */
    if (role === "user" && data?._id) {
      socketStore.addUser(data._id, socket.id);
      socket.join("users");
      console.log(`USER connected: ${data._id} (socket: ${socket.id})`);
    }

    else if (role === "admin" && data?._id && data.sessionId) {
      socketStore.addAdmin(data._id, data.sessionId, socket.id);
      socket.join("admins");
      
      // Emit session:online to all admins (including this admin's other sessions)
      // This tells other admins that a session is now online
      setTimeout(() => {
        io.to("admins").emit("session:online", { sessionId: data.sessionId })
      }, 500)
      
      console.log(`ADMIN connected: ${data._id} (session ${data.sessionId}) (socket: ${socket.id})`);
    }

    else {
      socketStore.addGuest(socket.id);
      socket.join("guests");
      console.log(`GUEST connected (socket: ${socket.id})`);
    }

    /* -------------------------------------------------------------
       HEARTBEAT ACK
    -------------------------------------------------------------- */
    socket.on("heartbeat:ack", () => {
      // Optional: update last active timestamp
    });


    /* -------------------------------------------------------------
       CUSTOM ROOMS
    -------------------------------------------------------------- */
    socket.on("room:join", (room) => {
      socketStore.joinRoom(room, socket.id);

      socket.join(room);
    });

    socket.on("room:leave", (room) => {
      socketStore.leaveRoom(room, socket.id);
      socket.leave(room);
    });

    /* -------------------------------------------------------------
       DISCONNECT CLEANUP
    -------------------------------------------------------------- */
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);

      const role = socket.auth?.role;
      const data = socket.auth?.data;

      // USER
      if (role === "user" && data?._id) {
        socketStore.removeUserSocket(socket.id);
      }

      // ADMIN
      if (role === "admin" && data?.sessionId) {
        socketStore.removeAdminSocket(socket.id);
        io.to("admins").emit("session:offline", { sessionId: data.sessionId })

      }

      // GUEST
      socketStore.removeGuestSocket(socket.id);

      // CUSTOM ROOMS CLEANUP
      for (const [room, set] of socketStore.rooms.entries()) {
        if (set.has(socket.id)) {
          set.delete(socket.id);
          if (set.size === 0) socketStore.rooms.delete(room);
        }
      }
    });
  });

  return io;
}

/* -------------------------------------------------------------
   HELPERS
-------------------------------------------------------------- */

export function getIO() {
  if (!io) throw new Error("Socket not initialized");
  return io;
}

/* -------------------------------------------------------------
   EMIT TO USER
-------------------------------------------------------------- */
export function emitToUser(userId, event, payload) {
  if (!io) return;

  const sockets = socketStore.getUserAllSockets(userId);

  for (const socketId of sockets) {
    io.to(socketId).emit(event, payload);
  }
}

/* -------------------------------------------------------------
   EMIT TO ADMIN (ALL SESSIONS)
-------------------------------------------------------------- */
export function emitToAdmin(adminId, event, payload, exceptID = []) {
  if (!io) return;

  const sockets = socketStore.getAdminAllSockets(adminId);

  // Normalize exceptID to always be an array
  const exceptArray = Array.isArray(exceptID) ? exceptID : [exceptID];

  for (const socketId of sockets) {
    if (exceptArray.includes(socketId)) continue;

    io.to(socketId).emit(event, payload);
  }
}


/* -------------------------------------------------------------
   EMIT TO ROOM
-------------------------------------------------------------- */
export function emitToRoom(room, event, payload, exceptID = []) {
  if (!io) return;

  const exceptArray = Array.isArray(exceptID) ? exceptID : [exceptID];

  if (exceptArray.length > 0) {
    io.to(room).except(exceptArray).emit(event, payload);
  } else {
    io.to(room).emit(event, payload);
  }
}

/* -------------------------------------------------------------
   EMIT TO A SPECIFIC ADMIN SESSION
-------------------------------------------------------------- */

// TODO: Emit to session should be renamed to emitToAdminSession or emitToSession logic should be used for 
// TODO: the user as well
export function emitToSession(adminId, sessionId, event, payload) {
  if (!io) return;

  const sockets = socketStore.getAdminSessionSockets(adminId, sessionId);
  if (!sockets || sockets.size === 0) return;

  for (const socketId of sockets) {
    io.to(socketId).emit(event, payload);
  }
}

/* -------------------------------------------------------------
   BROADCAST COUNT INFO TO ADMINS
-------------------------------------------------------------- */
export function broadcastCounts() {
  if (!io) return;
  const counts = socketStore.getOnlineCounts();
  io.to("admins").emit("online:counts", counts);
}

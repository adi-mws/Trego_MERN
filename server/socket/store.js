// socket/store.js

export const socketStore = {
  // Structure:
  // userId -> Map(sessionId -> Set(socketId))
  users: new Map(),

  normalizeId(value) {
    return String(value || "");
  },


  // * Add user socket
  addUser(userId, sessionId, socketId) {
    const normalizedUserId = this.normalizeId(userId);
    const normalizedSessionId = this.normalizeId(sessionId);

    if (!this.users.has(normalizedUserId)) {
      this.users.set(normalizedUserId, new Map());
    }

    const sessions = this.users.get(normalizedUserId);

    if (!sessions.has(normalizedSessionId)) {
      sessions.set(normalizedSessionId, new Set());
    }

    sessions.get(normalizedSessionId).add(socketId);
  },

  // * Remove socket on disconnect
  removeSocket(socketId) {
    for (const [userId, sessions] of this.users.entries()) {
      for (const [sessionId, socketSet] of sessions.entries()) {
        if (socketSet.has(socketId)) {
          socketSet.delete(socketId);

          // remove empty session
          if (socketSet.size === 0) {
            sessions.delete(sessionId);
          }

          // remove user if no sessions left
          if (sessions.size === 0) {
            this.users.delete(userId);
          }

          return { userId, sessionId };
        }
      }
    }

    return null;
  },

  // Get all sessions of user
  getUserSessions(userId) {
    return this.users.get(this.normalizeId(userId)) || new Map();
  },

  // Get all sockets of user (all sessions)
  getUserAllSockets(userId) {
    const result = new Set();
    const sessions = this.getUserSessions(userId);

    for (const socketSet of sessions.values()) {
      socketSet.forEach((sid) => result.add(sid));
    }

    return result;
  },

  // Get sockets of a specific session
  getUserSessionSockets(userId, sessionId) {
    return this.getUserSessions(userId).get(this.normalizeId(sessionId)) || new Set();
  },

  // Check if user is online
  isUserOnline(userId) {
    return this.getUserAllSockets(userId).size > 0;
  },

  // Get total socket count
  getOnlineSocketCount() {
    let total = 0;

    for (const sessions of this.users.values()) {
      for (const socketSet of sessions.values()) {
        total += socketSet.size;
      }
    }

    return total;
  },

  // !DEBUGGER
  debug() {
    console.log("Socket Store Snapshot:");
    for (const [userId, sessions] of this.users.entries()) {
      console.log(`User ${userId}:`);
      for (const [sessionId, sockets] of sessions.entries()) {
        console.log(`Session ${sessionId}:`, [...sockets]);
      }
    }
  }
};

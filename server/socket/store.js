// socket/store.js

import { isObjectIdOrHexString } from "mongoose";


// Globale socket store for the backend to store everything at once in the realtime
export const socketStore = {
  // DATA STRUCTURE

  users: new Map(),     // userId -> Set(socketId)
  admins: new Map(),    // adminId -> Map(sessionId -> Set(socketId))
  guests: new Set(),    // Set(socketId)
  rooms: new Map(),     // roomName -> Set(socketId)

  // USERS (NO SESSIONS)

  addUser(userId, socketId) {
    if (!this.users.has(userId)) {
      this.users.set(userId, new Set());
    }
    this.users.get(userId).add(socketId);
  },

  removeUserSocket(socketId) {
    for (const [userId, sockets] of this.users.entries()) {
      if (sockets.has(socketId)) {
        sockets.delete(socketId);

        if (sockets.size === 0) {
          this.users.delete(userId);
        }
        return;
      }
    }
  },

  getUserAllSockets(userId) {
    return this.users.get(userId) || new Set();
  },

  findSocketByUserId(userId) {
    return this.getUserAllSockets(userId);
  },

  //  ADMINS (SESSION BASED)

  addAdmin(adminId, sessionId, socketId) {
    if (!this.admins.has(adminId)) {
      this.admins.set(adminId, new Map());
    }


    const sessions = this.admins.get(adminId);

    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, new Set());
    }

    sessions.get(sessionId).add(socketId);


  },

  removeAdminSocket(socketId) {
    for (const [adminId, sessions] of this.admins.entries()) {
      for (const [sessionId, socketSet] of sessions.entries()) {
        if (socketSet.has(socketId)) {
          socketSet.delete(socketId);

          // Remove empty session
          if (socketSet.size === 0) sessions.delete(sessionId);

          // Remove admin object if empty
          if (sessions.size === 0) this.admins.delete(adminId);

          return;
        }
      }
    }
  },

  getAdminSessions(adminId) {
    return this.admins.get(adminId) || new Map();
  },

  getAdminSessionSockets(adminId, sessionId) {
    return this.getAdminSessions(adminId).get(sessionId) || new Set();
  },

  getAdminAllSockets(adminId) {
    const all = new Set();
    const sessions = this.getAdminSessions(adminId);

    for (const s of sessions.values()) {
      s.forEach(id => all.add(id));
    }

    return all;
  },

  findSocketByAdminId(adminId) {
    return this.getAdminAllSockets(adminId);
  },

  findSocketBySessionId(sessionId) {
    const result = new Set();

    for (const sessions of this.admins.values()) {
      if (sessions.has(sessionId)) {
        sessions.get(sessionId).forEach(sid => result.add(sid));
      }
    }

    return result;
  },

  // GUESTS

  addGuest(socketId) {
    this.guests.add(socketId);
  },

  removeGuestSocket(socketId) {
    this.guests.delete(socketId);
  },

  // ROOMS
  joinRoom(room, socketId) {
    if (!this.rooms.has(room)) {
      this.rooms.set(room, new Set());
    }

    this.rooms.get(room).add(socketId);
  },

  leaveRoom(room, socketId) {
    if (!this.rooms.has(room)) return;

    const set = this.rooms.get(room);
    set.delete(socketId);

    if (set.size === 0) {
      this.rooms.delete(room);
    }
  },

  getRoomSockets(room) {
    return this.rooms.get(room) || new Set();
  },

  isAdminOnline(adminId) {
    if (!this.admins.has(adminId)) return false;

    const sessions = this.admins.get(adminId);

    for (const sockets of sessions.values()) {
      if (sockets.size > 0) return true;
    }

    return false;
  },
  isUserOnline(userId) {
    return this.users.has(userId) && this.users.get(userId).size > 0;
  },

  isAdminSessionOnline(adminId, sessionId) {
    return (
      this.admins.has(adminId) &&
      this.admins.get(adminId).has(sessionId) &&
      this.admins.get(adminId).get(sessionId).size > 0
    );
  },

  // COUNTS

  getOnlineCounts() {
    let total = 0;

    // Users
    for (const set of this.users.values()) {
      total += set.size;
    }

    // Admin session sockets
    for (const sessions of this.admins.values()) {
      for (const set of sessions.values()) {
        total += set.size;
      }
    }

    // Guests
    total += this.guests.size;

    return { total };
  }
};

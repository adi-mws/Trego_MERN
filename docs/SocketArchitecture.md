# ⚡ Socket Architecture Documentation

## 🧠 Overview

The Socket Architecture is designed to support:

* **Real-time updates (UI sync)**
* **Multi-device + multi-session users**
* **Scalable event delivery**
* Clean separation between:

  * 🔔 Notifications (guaranteed delivery)
  * ⚡ Live events (contextual updates)

---

# 🧩 Core Concepts

## 1. User-Centric Design

Sockets are structured around **users**, not individual connections.

### Why?

A single user can have:

* multiple devices
* multiple browser tabs
* multiple reconnects

👉 All must stay in sync

---

## 2. Rooms (Delivery Layer)

Socket.IO rooms are used for **event delivery**

### Types of Rooms:

#### 👤 User Room

```txt
user:<userId>
```

* contains all sockets of a user
* used for notifications and personal events

---

#### 🏢 Workspace Room

```txt
workspace:<workspaceId>
```

* contains all users currently active in workspace
* used for real-time UI updates


# 🧠 3. Socket Store (Intelligence Layer)

## Structure

```js
users: Map<
  userId,
  Map<
    sessionId,
    Set<socketId>
  >
>
```

---

## Visual Representation

```txt
users = {
  user1: {
    sessionA: [socket1, socket2],
    sessionB: [socket3]
  }
}
```

---

## Purpose

The store is used for:

* tracking online users
* managing sessions
* excluding sessions
* analytics/debugging

---

## ⚠️ Important

> Store is NOT used for emitting events

👉 Rooms handle delivery
👉 Store handles logic

---

# 🔄 Connection Lifecycle

## 1. On Connect

```js
socketStore.addUser(userId, sessionId, socket.id);

// join user room
socket.join(`user:${userId}`);

// join active workspace
socket.join(`workspace:${activeWorkspaceId}`);

// optional: join session room
socket.join(`session:${sessionId}`);
```

---

## 2. On Disconnect

```js
socketStore.removeSocket(socket.id);

socket.leave(`user:${userId}`);
socket.leave(`workspace:${workspaceId}`);
socket.leave(`session:${sessionId}`);
```

---

# ⚡ Event Routing Strategy

## 🔔 Notifications (User-Based)

```js
io.to(`user:${userId}`).emit("notification:new", payload);
```

### Characteristics:

* guaranteed delivery
* reaches all devices
* independent of workspace

---

## ⚡ Real-Time UI Events (Workspace-Based)

```js
io.to(`workspace:${workspaceId}`).emit("task:updated", payload);
```

### Characteristics:

* only active users receive
* reduces unnecessary traffic
* context-aware updates

---

# 🚫 Excluding Current Session

## Problem:

User performs an action → should NOT receive same event

---

## Solution 1 (Socket Level)

```js
socket.broadcast.to(`user:${userId}`).emit(...)
```

---

## Solution 2 (Session Level - Recommended)

```js
io.to(`user:${userId}`)
  .except(`session:${sessionId}`)
  .emit("event", payload);
```

---

# 🧠 Workspace Strategy

## Recommended Approach

### On connect:

* join `user:<id>`
* join **active workspace only**

---

### On workspace switch:

```js
socket.join(`workspace:${workspaceId}`);
```

---

### Optional:

Join all workspaces (simpler but less scalable)

---

# 📡 Event Naming Convention

## Pattern:

```txt
<domain>:<action>
```

---

## Examples:

### Notifications

* `notification:new`
* `notification:read`

---

### Tasks

* `task:created`
* `task:updated`

---

### Workspace

* `workspace:joined`
* `workspace:updated`

---

### AI

* `ai:suggestion`
* `ai:decision`

---

# 📦 Payload Structure

Standardized payload format:

```js
{
  type: "task:updated",
  workspaceId,
  entityId,
  data: {},
  triggeredByType: "USER" | "SYSTEM" | "AGENT",
  timestamp: Date.now()
}
```

---

# 🔥 Best Practices

## ✅ DO

* use rooms for broadcasting
* keep store clean and minimal
* separate user vs workspace events
* standardize event names

---

## ❌ DON'T

* emit manually using socket lists
* mix notification + UI events
* overload rooms unnecessarily

---

# 🧠 System Layers Summary

| Layer  | Responsibility          |
| ------ | ----------------------- |
| Store  | tracking + intelligence |
| Rooms  | delivery mechanism      |
| Events | communication protocol  |

---

# 🚀 Final Architecture

You now have:

* **User-level delivery system**
* **Workspace-level collaboration system**
* **Session-aware control**
* **Scalable real-time engine**

---

# 💡 Final Insight

> “Send only what matters, where it matters”

* Notifications → always reach user
* UI updates → only where relevant

👉 This keeps the system:

* efficient ⚡
* scalable 📈
* clean 🧠

---

# 🔮 Future Enhancements

* Redis adapter (horizontal scaling)
* active tab detection
* offline queue + retry
* push notification integration

---

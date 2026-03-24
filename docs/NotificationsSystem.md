# 🔔 Notification System Documentation

## 🧠 Overview

The Notification System is designed to:

* Deliver **reliable, user-targeted notifications**
* Support **multi-device + multi-session users**
* Integrate with **agentic AI (triggeredByType)**
* Work seamlessly with **Socket.IO real-time delivery**

---

# 🧩 Core Concepts

## 1. Scope (Ownership)

Defines **where the notification belongs**

### Fields:

* `scopeType`: `"WORKSPACE"` | `"ACCOUNT"`
* `scopeId`: ObjectId

### Meaning:

* `WORKSPACE` → shared/team-level notification
* `ACCOUNT` → personal/user-level notification

---

## 2. Entity (Context)

Defines **what the notification is about**

### Fields:

* `entityType`
* `entityId`

### Examples:

* TASK → specific task
* PROJECT → specific project
* WORKFLOW → workflow execution

---

## 3. Trigger Source

Defines **who created the notification**

### Field:

* `triggeredByType`

### Values:

* `"USER"` → user action
* `"SYSTEM"` → backend/system event
* `"AGENT"` → AI-generated

---

# 📦 Schema

```js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    toastMessage: { type: String, trim: true },
    image: String,

    type: {
      type: String,
      enum: ["INFO", "ACTION", "ALERT", "SYSTEM"],
      required: true,
    },

    important: { type: Boolean, default: false },

    triggeredByType: {
      type: String,
      enum: ["USER", "SYSTEM", "AGENT"],
      required: true,
    },

    triggeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    scopeType: {
      type: String,
      enum: ["WORKSPACE", "ACCOUNT"],
      required: true,
    },

    scopeId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    entityType: {
      type: String,
      enum: [
        "TASK",
        "PROJECT",
        "WORKSPACE",
        "ACCOUNT",
        "LABEL",
        "SYSTEM",
        "SUBTASK",
        "WORKFLOW",
        null,
      ],
      default: null,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    link: String,
  },
  { timestamps: true }
);

// TTL: auto delete after 10 days
notificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 10 * 24 * 60 * 60 }
);

export default mongoose.model("Notification", notificationSchema);
```

---

# ⚡ Real-Time Delivery Strategy

## ✅ Rule:

Notifications are **always delivered via user rooms**

### Room:

```
user:<userId>
```

---

## Emit Example:

```js
io.to(`user:${userId}`).emit("notification:new", notification);
```

---

## ❗ Why not workspace rooms?

Because:

* user may not be inside workspace
* notifications must always reach user
* supports multi-device delivery

---

# 🔄 Notification Flow

## 1. Event Happens

* task assigned
* AI action triggered
* system alert

---

## 2. Notification Created

```js
createNotification({
  type: "ACTION",
  triggeredByType: "USER",
  scopeType: "WORKSPACE",
  scopeId: workspaceId,
  entityType: "TASK",
  entityId: taskId
});
```

---

## 3. Real-Time Emit

```js
io.to(`user:${userId}`).emit("notification:new", notification);
```

---

## 4. Frontend Receives

```js
socket.on("notification:new", (data) => {
  // show toast
  // update notification list
});
```

---

# 🎯 Example Notifications

## Task Assigned

```js
{
  title: "Task Assigned",
  message: "You were assigned a new task",
  type: "ACTION",
  triggeredByType: "USER",
  scopeType: "WORKSPACE",
  scopeId: workspaceId,
  entityType: "TASK",
  entityId: taskId
}
```

---

## AI Action

```js
{
  title: "Task Reassigned",
  message: "AI reassigned the task due to inactivity",
  type: "SYSTEM",
  triggeredByType: "AGENT",
  scopeType: "WORKSPACE",
  scopeId: workspaceId,
  entityType: "TASK",
  entityId: taskId
}
```

---

## Account Alert

```js
{
  title: "New Login Detected",
  message: "A new device logged into your account",
  type: "ALERT",
  triggeredByType: "SYSTEM",
  scopeType: "ACCOUNT",
  scopeId: userId
}
```

---

# 🧠 Design Principles

### 1. Separation of Concerns

* `scope` → ownership
* `entity` → context
* `trigger` → source

---

### 2. User-Centric Delivery

All notifications go through:

```
user:<userId>
```

---

### 3. Stateless Real-Time

* DB = source of truth
* Socket = delivery mechanism

---

### 4. Scalable for AI

Supports:

* AI-triggered events
* future automation
* audit tracking

---

# 🔥 Future Enhancements (Optional)

* `isRead`, `readAt`
* notification grouping
* priority levels
* batching
* push notifications (FCM)

---

# 💡 Final Summary

The system is built on:

* **User-based delivery (reliable)**
* **Scoped ownership (workspace/account)**
* **Entity linking (context-aware)**
* **AI-ready triggers (agentic support)**

👉 This makes it scalable, flexible, and production-ready.

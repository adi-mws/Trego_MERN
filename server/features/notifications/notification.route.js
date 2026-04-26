import express from "express";
import ensureAuth from "../../middlewares/ensureAuth.js";
import {
  getNotifications,
  markAsRead,
  clearNotification,
  clearAllNotifications,
  markAllAsRead,
} from "./notification.controller.js";

const router = express.Router();

router.get("/", ensureAuth, getNotifications);
router.patch("/:notificationId/read", ensureAuth, markAsRead);
router.patch("/read-all", ensureAuth, markAllAsRead);
router.delete("/clear-all", ensureAuth, clearAllNotifications);
router.delete("/:notificationId", ensureAuth, clearNotification);

export default router;

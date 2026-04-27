import express from "express";
import ensureAuth from "../../middlewares/ensureAuth.js";
import {
  archiveAgentChatController,
  createAgentChatController,
  getAgentChatController,
  listAgentChatsController,
  sendAgentChatMessageController,
} from "./agentChat.controller.js";

const router = express.Router();

router.get("/workspaces/:workspaceSlug/chats", ensureAuth, listAgentChatsController);
router.post("/workspaces/:workspaceSlug/chats", ensureAuth, createAgentChatController);
router.get("/workspaces/:workspaceSlug/chats/:chatId", ensureAuth, getAgentChatController);
router.post("/workspaces/:workspaceSlug/chats/:chatId/messages", ensureAuth, sendAgentChatMessageController);
router.patch("/workspaces/:workspaceSlug/chats/:chatId/archive", ensureAuth, archiveAgentChatController);

export default router;

import {
  archiveAgentChat,
  createAgentChat,
  getAgentChat,
  listAgentChats,
  sendAgentChatMessage,
} from "./agentChat.service.js";

export const listAgentChatsController = async (req, res, next) => {
  try {
    const { workspaceSlug } = req.params;
    const chats = await listAgentChats({
      workspaceSlug,
      userId: req.user?.userId,
    });

    return res.status(200).json({ success: true, data: { chats } });
  } catch (error) {
    next(error);
  }
};

export const createAgentChatController = async (req, res, next) => {
  try {
    const { workspaceSlug } = req.params;
    const { title, scope, mode, projectId, contexts = [] } = req.body || {};

    const chat = await createAgentChat({
      workspaceSlug,
      userId: req.user?.userId,
      title,
      scope,
      mode,
      projectId,
      contexts,
    });

    return res.status(201).json({ success: true, data: { chat } });
  } catch (error) {
    next(error);
  }
};

export const getAgentChatController = async (req, res, next) => {
  try {
    const { workspaceSlug, chatId } = req.params;
    const chat = await getAgentChat({
      workspaceSlug,
      userId: req.user?.userId,
      chatId,
    });

    return res.status(200).json({ success: true, data: { chat } });
  } catch (error) {
    next(error);
  }
};

export const sendAgentChatMessageController = async (req, res, next) => {
  try {
    const { workspaceSlug, chatId } = req.params;
    const data = await sendAgentChatMessage({
      workspaceSlug,
      userId: req.user?.userId,
      chatId,
      payload: req.body || {},
    });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const archiveAgentChatController = async (req, res, next) => {
  try {
    const { workspaceSlug, chatId } = req.params;
    const chat = await archiveAgentChat({
      workspaceSlug,
      userId: req.user?.userId,
      chatId,
    });

    return res.status(200).json({ success: true, data: { chat } });
  } catch (error) {
    next(error);
  }
};

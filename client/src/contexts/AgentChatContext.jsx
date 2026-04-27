/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { callApi } from "../api/api";
import { resolveWorkspaceRole } from "../utils/workspaceRole.utils";

const AgentChatContext = createContext(null);

export function AgentChatProvider({ children }) {
  const { workspaceSlug } = useParams();
  const workspace = useSelector((state) => state.workspace);
  const authUser = useSelector((state) => state.auth?.data);
  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const canUseAgent = ["OWNER", "ADMIN"].includes(workspaceRole);

  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState("");

  const closeDrawer = useCallback(() => setOpen(false), []);
  const openDrawer = useCallback(() => setOpen(true), []);
  const toggleDrawer = useCallback(() => setOpen((current) => !current), []);

  const loadChats = useCallback(async () => {
    if (!workspaceSlug || !canUseAgent) {
      setChats([]);
      setActiveChatId(null);
      setActiveChat(null);
      setMessages([]);
      return;
    }

    setLoadingChats(true);
    setError("");

    try {
      const response = await callApi({
        method: "get",
        url: `/agent/workspaces/${workspaceSlug}/chats`,
      });

      const nextChats = response.data?.data?.chats || [];
      setChats(nextChats);

      setActiveChatId((current) => {
        if (current && nextChats.some((chat) => String(chat.id) === String(current))) {
          return current;
        }
        return nextChats[0]?.id || null;
      });
    } catch (err) {
      setChats([]);
      setActiveChatId(null);
      setActiveChat(null);
      setMessages([]);
      setError(err?.response?.data?.message || err?.message || "Failed to load agent chats");
    } finally {
      setLoadingChats(false);
    }
  }, [canUseAgent, workspaceSlug]);

  const loadChat = useCallback(
    async (chatId) => {
      if (!workspaceSlug || !canUseAgent || !chatId) {
        setActiveChat(null);
        setMessages([]);
        return;
      }

      setLoadingChat(true);
      setError("");

      try {
        const response = await callApi({
          method: "get",
          url: `/agent/workspaces/${workspaceSlug}/chats/${chatId}`,
        });

        const chat = response.data?.data?.chat || null;
        setActiveChat(chat);
        setMessages(Array.isArray(chat?.messages) ? chat.messages : []);
      } catch (err) {
        setActiveChat(null);
        setMessages([]);
        setError(err?.response?.data?.message || err?.message || "Failed to load chat");
      } finally {
        setLoadingChat(false);
      }
    },
    [canUseAgent, workspaceSlug]
  );

  const createChat = useCallback(
    async (payload = {}) => {
      if (!workspaceSlug || !canUseAgent) {
        throw new Error("Agent chats are not available");
      }

      setError("");
      const response = await callApi({
        method: "post",
        url: `/agent/workspaces/${workspaceSlug}/chats`,
        data: payload,
      });

      const chat = response.data?.data?.chat || null;
      if (chat) {
        setChats((current) => [chat, ...current.filter((item) => String(item.id) !== String(chat.id))]);
        setActiveChatId(chat.id);
        await loadChat(chat.id);
      }
      return chat;
    },
    [canUseAgent, loadChat, workspaceSlug]
  );

  const archiveChat = useCallback(
    async (chatId) => {
      if (!workspaceSlug || !canUseAgent || !chatId) return null;

      const response = await callApi({
        method: "patch",
        url: `/agent/workspaces/${workspaceSlug}/chats/${chatId}/archive`,
      });

      const chat = response.data?.data?.chat || null;
      setChats((current) => current.filter((item) => String(item.id) !== String(chatId)));
      if (String(activeChatId) === String(chatId)) {
        setActiveChatId(null);
        setActiveChat(null);
        setMessages([]);
      }
      return chat;
    },
    [activeChatId, canUseAgent, workspaceSlug]
  );

  const sendMessage = useCallback(
    async (payload = {}) => {
      if (!workspaceSlug || !canUseAgent) {
        throw new Error("Agent chats are not available");
      }

      let createdChat = null;
      if (!activeChatId) {
        createdChat = await createChat({
          title: payload.prompt || "New chat",
          scope: payload.scope,
          mode: payload.mode,
          projectId: payload.projectId || null,
          contexts: payload.contexts || [],
        });

        if (!createdChat?.id) {
          throw new Error("Unable to create a new chat");
        }
      }

      const currentChatId = activeChatId || createdChat?.id || chats[0]?.id;
      if (!currentChatId) {
        throw new Error("No active chat selected");
      }

      setSendingMessage(true);
      setError("");
      try {
        const response = await callApi({
          method: "post",
          url: `/agent/workspaces/${workspaceSlug}/chats/${currentChatId}/messages`,
          data: payload,
        });

        const data = response.data?.data || {};
        const nextChat = data.chat || null;
        if (nextChat) {
          setChats((current) => [nextChat, ...current.filter((item) => String(item.id) !== String(nextChat.id))]);
          setActiveChat(nextChat);
          setActiveChatId(nextChat.id);
          setMessages(Array.isArray(nextChat.messages) ? nextChat.messages : []);
        } else if (Array.isArray(data.messages)) {
          setMessages(data.messages);
        }
        return data;
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to send message");
        throw err;
      } finally {
        setSendingMessage(false);
      }
    },
    [activeChatId, canUseAgent, chats, createChat, workspaceSlug]
  );

  useEffect(() => {
    if (!canUseAgent || !workspaceSlug) {
      setChats([]);
      setActiveChatId(null);
      setActiveChat(null);
      setMessages([]);
      return;
    }

    loadChats();
  }, [canUseAgent, loadChats, workspaceSlug]);

  useEffect(() => {
    if (!activeChatId) {
      setActiveChat(null);
      setMessages([]);
      return;
    }

    const current = chats.find((chat) => String(chat.id) === String(activeChatId));
    if (current) {
      setActiveChat(current);
    }

    void loadChat(activeChatId);
  }, [activeChatId, chats, loadChat]);

  const value = useMemo(() => ({
    open,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    canUseAgent,
    workspaceSlug,
    chats,
    activeChatId,
    activeChat,
    messages,
    loadingChats,
    loadingChat,
    sendingMessage,
    error,
    setActiveChatId,
    setMessages,
    refreshChats: loadChats,
    loadChat,
    createChat,
    archiveChat,
    sendMessage,
  }), [
    activeChat,
    activeChatId,
    archiveChat,
    canUseAgent,
    chats,
    closeDrawer,
    createChat,
    error,
    loadChat,
    loadChats,
    loadingChat,
    loadingChats,
    messages,
    open,
    openDrawer,
    sendingMessage,
    sendMessage,
    toggleDrawer,
    workspaceSlug,
  ]);

  return (
    <AgentChatContext.Provider value={value}>
      {children}
    </AgentChatContext.Provider>
  );
}

export function useAgentChat() {
  const context = useContext(AgentChatContext);
  if (!context) {
    throw new Error("useAgentChat must be used within AgentChatProvider");
  }
  return context;
}

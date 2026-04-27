import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";
import { useAgentChat } from "../../../contexts/AgentChatContext";

const CONTEXT_OPTIONS = [
  { key: "project", label: "Project" },
  { key: "tasks", label: "Tasks" },
  { key: "projectRoles", label: "Project Roles" },
  { key: "comments", label: "Comments" },
  { key: "stateHistory", label: "State History" },
  { key: "members", label: "Members" },
  { key: "workflow", label: "Workflow" },
  { key: "categories", label: "Categories" },
];

const MODE_OPTIONS = [
  { key: "ask", label: "Ask" },
  { key: "inspect", label: "Inspect" },
  { key: "plan", label: "Plan" },
];

const SCOPE_OPTIONS = [
  { key: "project", label: "Current Project" },
  { key: "workspace", label: "Workspace" },
  { key: "all-projects", label: "All Projects" },
];

function normalizeProjects(projects) {
  if (Array.isArray(projects)) return projects;
  if (!projects) return [];
  if (Array.isArray(projects.items)) return projects.items;
  if (Array.isArray(projects.projects)) return projects.projects;
  if (typeof projects === "object") {
    return Object.values(projects).filter((item) => item && typeof item === "object");
  }
  return [];
}

function ChatBubble({ message }) {
  const isUser = message.role === "user";
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Stack direction="row" spacing={1.25} justifyContent={isUser ? "flex-end" : "flex-start"} sx={{ width: "100%" }}>
      {!isUser && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main", flexShrink: 0 }}>
          T
        </Avatar>
      )}
      <Box sx={{ maxWidth: { xs: "100%", sm: "80%" }, minWidth: 0, display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start" }}>
        <Paper
          variant="outlined"
          sx={{
            px: 1.5,
            py: 1.2,
            borderRadius: 3,
            bgcolor: isUser ? "primary.main" : isDark ? "rgba(255,255,255,0.06)" : "background.paper",
            color: isUser ? "primary.contrastText" : "text.primary",
            borderColor: isUser ? "primary.main" : isDark ? "rgba(255,255,255,0.12)" : "divider",
          }}
        >
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, fontWeight: 400 }}>
            {message.text}
          </Typography>
        </Paper>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
          {message.meta}
        </Typography>
      </Box>
      {isUser && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: "secondary.main", flexShrink: 0 }}>
          U
        </Avatar>
      )}
    </Stack>
  );
}

export default function GlobalAgentChatPanel() {
  const outletContext = useOutletContext();
  const workspaceState = useSelector((state) => state.workspace);
  const authUser = useSelector((state) => state.auth?.data);
  const workspace = outletContext?.workspace || workspaceState;
  const workspaceProjects = useMemo(
    () => normalizeProjects(workspace?.projects || workspace?.currentWorkspace?.projects),
    [workspace?.projects, workspace?.currentWorkspace?.projects]
  );
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const {
    canUseAgent,
    chats,
    activeChatId,
    activeChat,
    messages,
    loadingChats,
    loadingChat,
    sendingMessage,
    error,
    setActiveChatId,
    refreshChats,
    createChat,
    archiveChat,
    sendMessage,
  } = useAgentChat();

  const [scope, setScope] = useState("workspace");
  const [mode, setMode] = useState("ask");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedContexts, setSelectedContexts] = useState(["project", "tasks", "projectRoles"]);
  const [composer, setComposer] = useState("");
  const [activeView, setActiveView] = useState("chat");

  const selectedProject = useMemo(
    () => workspaceProjects.find((project) => String(project?._id) === String(selectedProjectId)) || null,
    [selectedProjectId, workspaceProjects]
  );

  useEffect(() => {
    if (!activeChat) return;
    const frame = window.requestAnimationFrame(() => {
      setScope(activeChat.scope || "workspace");
      setMode(activeChat.mode || "ask");
      setSelectedProjectId(activeChat.projectId || "");
      setSelectedContexts(Array.isArray(activeChat.contexts) && activeChat.contexts.length > 0
        ? activeChat.contexts
        : ["project", "tasks", "projectRoles"]);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeChat]);

  useEffect(() => {
    if (!selectedProjectId && scope === "project" && workspaceProjects[0]?._id) {
      const frame = window.requestAnimationFrame(() => {
        setSelectedProjectId(workspaceProjects[0]._id);
      });

      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [scope, selectedProjectId, workspaceProjects]);

  const activeChatTitle = activeChat?.title || "New chat";

  const payloadPreview = useMemo(() => ({
    workspaceId: workspace?._id || null,
    workspaceSlug: workspace?.slug || null,
    projectId: selectedProject?._id || null,
    projectName: selectedProject?.name || null,
    scope,
    mode,
    contexts: selectedContexts,
    prompt: composer.trim() || null,
    mentions: [],
  }), [composer, mode, scope, selectedContexts, selectedProject, workspace]);

  const toggleContext = (key) => {
    setSelectedContexts((current) => (
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    ));
  };

  const handleNewChat = async () => {
    const title = composer.trim().slice(0, 48) || `Chat ${new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
    const chat = await createChat({
      title,
      scope,
      mode,
      projectId: selectedProject?._id || null,
      contexts: selectedContexts,
    });
    if (chat?.id) {
      setActiveChatId(chat.id);
    }
  };

  const handleSend = async () => {
    const prompt = composer.trim();
    if (!prompt) return;

    setComposer("");
    await sendMessage({
      prompt,
      scope,
      mode,
      projectId: selectedProject?._id || null,
      projectName: selectedProject?.name || null,
      contexts: selectedContexts,
      mentions: [],
    });
  };

  const hasWorkspace = Boolean(workspace?.slug || workspace?.name || workspace?._id || workspace?.currentWorkspace);

  return (
    <Box sx={{ height: "100%", minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column", bgcolor: "background.default" }}>
      <Box sx={{ px: { xs: 1, sm: 1.5 }, pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <AutoAwesomeOutlinedIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight={800} noWrap>
                Trego Agent
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                Saved chats per owner/admin
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center">
            <Button
              size="small"
              startIcon={<AddOutlinedIcon />}
              onClick={handleNewChat}
              disabled={!canUseAgent}
              sx={{ textTransform: "none", fontWeight: 400 }}
            >
              New Chat
            </Button>
            <IconButton size="small" onClick={refreshChats} disabled={loadingChats}>
              <RefreshOutlinedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      {!hasWorkspace ? (
        <Alert severity="info">Workspace context is still loading.</Alert>
      ) : !canUseAgent ? (
        <Alert severity="warning">The Trego Agent is available only for workspace admins and owners.</Alert>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: "grid", gridTemplateColumns: { xs: "1fr", md: "280px 1fr" }, gap: 1.25, overflow: "hidden" }}>
          <Paper
            variant="outlined"
            sx={{
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              bgcolor: isDark ? "rgba(18,18,18,0.92)" : "background.paper",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "divider",
            }}
          >
            <Box sx={{ px: 1.25, py: 1, borderBottom: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.12)" : "divider" }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                Chats
              </Typography>
            </Box>
            <List dense disablePadding sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
              {chats.length === 0 ? (
                <Box sx={{ p: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No chats yet. Start a new one.
                  </Typography>
                </Box>
              ) : chats.map((chat) => {
                const active = String(chat.id) === String(activeChatId);
                return (
                  <ListItemButton
                    key={chat.id}
                    selected={active}
                    onClick={() => setActiveChatId(chat.id)}
                    sx={{ alignItems: "flex-start", gap: 1, py: 1.1, px: 1.25 }}
                  >
                    <Avatar sx={{ width: 28, height: 28, bgcolor: active ? "primary.main" : "action.hover", color: active ? "primary.contrastText" : "text.secondary", flexShrink: 0 }}>
                      T
                    </Avatar>
                    <ListItemText
                      primary={chat.title || "New chat"}
                      secondary={chat.lastMessage?.text || "No messages yet"}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 700 : 500, noWrap: true }}
                      secondaryTypographyProps={{ fontSize: 11, color: "text.secondary", noWrap: true }}
                    />
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <IconButton
                        size="small"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          await archiveChat(chat.id);
                        }}
                        sx={{ color: "text.secondary" }}
                      >
                        <ArchiveOutlinedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Stack>
                  </ListItemButton>
                );
              })}
            </List>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
              bgcolor: isDark ? "rgba(18,18,18,0.92)" : "background.paper",
              borderColor: isDark ? "rgba(255,255,255,0.12)" : "divider",
            }}
          >
            <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: isDark ? "rgba(255,255,255,0.12)" : "divider" }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" fontWeight={700} noWrap>
                    {activeChatTitle}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activeChat?.messagesCount || messages.length || 0} messages
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  <Button size="small" variant={activeView === "chat" ? "contained" : "outlined"} onClick={() => setActiveView("chat")} sx={{ textTransform: "none", fontWeight: 400 }}>
                    Chat
                  </Button>
                  <Button size="small" variant={activeView === "payload" ? "contained" : "outlined"} onClick={() => setActiveView("payload")} sx={{ textTransform: "none", fontWeight: 400 }}>
                    Payload
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              {error && (
                <Alert severity="warning" variant="outlined" sx={{ mx: 1.5, mt: 1.25, borderRadius: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 1.5, py: 1.5 }}>
                {activeView === "chat" ? (
                  <Stack spacing={1.5}>
                    {loadingChat ? (
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <CircularProgress size={16} />
                        <Typography variant="body2" color="text.secondary">
                          Loading chat...
                        </Typography>
                      </Stack>
                    ) : (
                      messages.map((message) => (
                        <ChatBubble key={message.id || `${message.role}-${message.createdAt}`} message={message} />
                      ))
                    )}
                    {sendingMessage && (
                      <ChatBubble
                        message={{ role: "assistant", text: "", meta: "Generating reply" }}
                        pending
                      />
                    )}
                  </Stack>
                ) : (
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? "rgba(255,255,255,0.04)" : "background.default",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "divider",
                      fontSize: 12,
                      lineHeight: 1.6,
                      overflowX: "auto",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {JSON.stringify(payloadPreview, null, 2)}
                  </Box>
                )}
              </Box>

              <Divider />

              <Box sx={{ p: 1.5 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <TextField
                      select
                      label="Scope"
                      size="small"
                      value={scope}
                      onChange={(e) => setScope(e.target.value)}
                      sx={{ minWidth: 150 }}
                    >
                      {SCOPE_OPTIONS.map((option) => (
                        <MenuItem key={option.key} value={option.key}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Mode"
                      size="small"
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      sx={{ minWidth: 120 }}
                    >
                      {MODE_OPTIONS.map((option) => (
                        <MenuItem key={option.key} value={option.key}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      select
                      label="Project"
                      size="small"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      sx={{ minWidth: 220, flex: 1 }}
                    >
                      <MenuItem value="">
                        <em>Workspace only</em>
                      </MenuItem>
                      {workspaceProjects.map((project) => (
                        <MenuItem key={project._id} value={project._id}>
                          {project.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {CONTEXT_OPTIONS.map((option) => (
                      <Chip
                        key={option.key}
                        label={option.label}
                        clickable
                        onClick={() => toggleContext(option.key)}
                        variant={selectedContexts.includes(option.key) ? "filled" : "outlined"}
                        color={selectedContexts.includes(option.key) ? "primary" : "default"}
                        sx={{ fontWeight: 400 }}
                      />
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="flex-end">
                    <TextField
                      fullWidth
                      multiline
                      minRows={1}
                      maxRows={5}
                      placeholder="Ask Trego Agent anything about the workspace."
                      value={composer}
                      onChange={(e) => setComposer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      sx={{
                        "& .MuiInputBase-root": {
                          borderRadius: 3,
                          fontWeight: 400,
                          bgcolor: isDark ? "rgba(255,255,255,0.05)" : "background.paper",
                        },
                      }}
                    />
                    <IconButton
                      color="primary"
                      onClick={handleSend}
                      disabled={!composer.trim() || sendingMessage}
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2.5,
                        border: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.12)" : "divider",
                        bgcolor: isDark ? "rgba(255,255,255,0.05)" : "background.paper",
                      }}
                    >
                      {sendingMessage ? <CircularProgress size={16} color="inherit" /> : <SendOutlinedIcon />}
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={`${authUser?.name || "You"}`} icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} />} size="small" variant="outlined" sx={{ fontWeight: 400 }} />
                    <Chip label={activeChatTitle} size="small" variant="outlined" sx={{ fontWeight: 400 }} />
                    <Chip label={scope} size="small" variant="outlined" sx={{ fontWeight: 400 }} />
                  </Stack>
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
}

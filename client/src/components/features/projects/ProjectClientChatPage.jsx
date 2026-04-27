import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import { PROJECT_ROUTES } from "../../../lib/routes";
import { isClient, isClientProjectRole } from "../../../utils/permissions.utils";
import { resolveWorkspaceRole } from "../../../utils/workspaceRole.utils";

function buildDraftReply(message, project) {
  const lower = String(message || "").toLowerCase();
  const name = project?.name || "this project";
  const description = project?.description?.trim();
  const members = project?.totalMembers || project?.memberships?.length || 0;
  const roleNames = Array.isArray(project?.currentUserRoleNames)
    ? project.currentUserRoleNames.filter(Boolean)
    : [];
  const roleLabel = roleNames.length ? roleNames.join(", ") : "Project Client";

  if (lower.includes("summary") || lower.includes("overview")) {
    return `${name} is the current project scope. ${description || "No project description has been added yet."} This chat will keep future answers limited to this project only.`;
  }

  if (lower.includes("member") || lower.includes("team")) {
    return `${name} currently has ${members} member${members === 1 ? "" : "s"} in scope, and your project role is ${roleLabel}. I can expand this into a project-only member view once the AI layer is connected.`;
  }

  if (lower.includes("task") || lower.includes("progress") || lower.includes("status")) {
    return `I will keep this scoped to ${name}. Right now the project chat shell is ready for task progress, blockers, and status summaries. The response engine will plug in next.`;
  }

  return `Project-only draft for ${name}: I captured "${message}". The next step is wiring the real AI response layer so the answer comes from this project's context only.`;
}

function MessageBubble({ message, pending = false }) {
  const isUser = message.role === "user";
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const bubbleBg = isUser
    ? theme.palette.primary.main
    : isDark
      ? "rgba(255,255,255,0.06)"
      : theme.palette.background.paper;
  const bubbleBorder = isUser
    ? theme.palette.primary.main
    : isDark
      ? "rgba(255,255,255,0.14)"
      : theme.palette.divider;

  return (
    <Stack
      direction="row"
      spacing={1.25}
      justifyContent={isUser ? "flex-end" : "flex-start"}
      sx={{ width: "100%" }}
    >
      {!isUser && (
        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", flexShrink: 0 }}>
          T
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: "82%" },
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            px: 1.75,
            py: 1.4,
            borderRadius: 3,
            bgcolor: bubbleBg,
            color: isUser ? "primary.contrastText" : "text.primary",
            borderColor: bubbleBorder,
            boxShadow: isUser
              ? 0
              : isDark
                ? "0 10px 24px rgba(0, 0, 0, 0.35)"
                : "0 10px 24px rgba(0, 0, 0, 0.06)",
          }}
        >
          {pending ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={14} thickness={5} />
              <Typography variant="body2" sx={{ lineHeight: 1.7, fontWeight: 400 }}>
                Generating a client reply...
              </Typography>
            </Stack>
          ) : (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.7,
                fontWeight: 400,
              }}
            >
              {message.text}
            </Typography>
          )}
        </Paper>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.6, fontWeight: 400 }}>
          {message.meta}
        </Typography>
      </Box>
      {isUser && (
        <Avatar sx={{ width: 32, height: 32, bgcolor: "secondary.main", flexShrink: 0 }}>
          U
        </Avatar>
      )}
    </Stack>
  );
}

export default function ProjectClientChatPage() {
  const { workspaceSlug, projectSlug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const project = useSelector((state) => state.project);
  const workspace = useSelector((state) => state.workspace);
  const authUser = useSelector((state) => state.auth?.data);
  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const isClientViewer = isClient(workspaceRole) || isClientProjectRole(project);
  const messagesEndRef = useRef(null);

  const [composer, setComposer] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [apiError, setApiError] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "This chat is locked to the current project context. Ask about scope, progress, members, or what should happen next.",
      meta: "Project-only preview",
    },
  ]);

  const projectContext = useMemo(() => {
    const roleNames = Array.isArray(project?.currentUserRoleNames)
      ? project.currentUserRoleNames.filter(Boolean)
      : [];

    return {
      projectName: project?.name || "Project",
      projectDescription: project?.description?.trim() || "No project description has been added yet.",
      members: project?.totalMembers || project?.memberships?.length || 0,
      roleNames,
    };
  }, [project]);

  const quickPrompts = useMemo(
    () => [
      "Summarize this project",
      "What should I focus on next?",
      "Who is part of this project?",
      "Show the current project scope",
    ],
    []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  if (project._id && !isClientViewer) {
    return (
      <Box sx={{ p: { xs: 1.5, md: 3 }, height: "100%", overflow: "auto" }}>
        <Alert
          severity="warning"
          sx={{
            borderRadius: 3,
            alignItems: "flex-start",
            "& .MuiAlert-message": { width: "100%" },
          }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 500 }}>
                Project chat is reserved for project clients
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
                This experience only appears inside projects where the current member has the Project Client role.
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={() => navigate(PROJECT_ROUTES.overview(workspaceSlug, projectSlug))}
                sx={{ fontWeight: 400, textTransform: "none" }}
              >
                Back to Project
              </Button>
            </Box>
          </Stack>
        </Alert>
      </Box>
    );
  }

  const handleSend = async (overrideText) => {
    const text = String(overrideText ?? composer).trim();
    if (!text || !project?._id) return;

    const stamp = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    const userMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text,
      meta: `You • ${stamp}`,
    };

    setApiError("");
    setMessages((current) => [...current, userMessage]);
    setComposer("");
    setIsThinking(true);

    const pendingId = `${Date.now()}-pending`;
    setMessages((current) => [
      ...current,
      {
        id: pendingId,
        role: "assistant",
        text: "",
        meta: "Client reply in progress",
        pending: true,
      },
    ]);

    const recentHistory = [...messages.filter((item) => item.id !== "welcome"), userMessage]
      .slice(-8)
      .map((item) => ({
        role: item.role,
        text: item.text,
      }));

    try {
      const response = await callApi({
        method: "post",
        url: `/projects/${project._id}/ai/chat`,
        data: {
          message: text,
          history: recentHistory,
        },
      });

      const replyText = response.data?.data?.reply || response.data?.reply;
      const replyStamp = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      setMessages((current) =>
        current.map((item) =>
          item.id === pendingId
            ? {
                id: `${Date.now()}-assistant`,
                role: "assistant",
                text: replyText || buildDraftReply(text, project),
                meta: replyText ? `Client reply • ${replyStamp}` : `Project-scoped fallback • ${replyStamp}`,
              }
            : item
        )
      );
    } catch (error) {
      const replyStamp = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      setApiError(error?.response?.data?.message || error?.message || "Project AI is unavailable right now.");
      setMessages((current) =>
        current.map((item) =>
          item.id === pendingId
            ? {
                id: `${Date.now()}-assistant`,
                role: "assistant",
                text: buildDraftReply(text, project),
                meta: `Project-scoped fallback • ${replyStamp}`,
              }
            : item
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  const handlePrompt = (prompt) => {
    setComposer(prompt);
  };

  const hasClientRole = projectContext.roleNames.some(
    (name) => String(name || "").trim().toLowerCase() === "project client"
  );
  const isDark = theme.palette.mode === "dark";
  const shellBg = isDark ? "#0d0d0f" : "background.default";
  const panelBg = isDark ? "rgba(18,18,18,0.92)" : "rgba(255,255,255,0.62)";
  const panelBorder = isDark ? "rgba(255,255,255,0.12)" : "divider";
  const infoBg = isDark ? "rgba(255,255,255,0.03)" : "transparent";
  const chipBorder = isDark ? "rgba(255,255,255,0.12)" : "divider";
  const chipBg = isDark ? "rgba(255,255,255,0.04)" : "transparent";

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        p: { xs: 1.25, md: 1.75 },
        bgcolor: shellBg,
      }}
    >
      <Box
        sx={{
          height: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxWidth: 980,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            px: 0.25,
            pt: 0.15,
            pb: 0.25,
            bgcolor: "transparent",
          }}
        >
          <Stack spacing={0.35}>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 500,
                  lineHeight: 1.2,
                  fontSize: { xs: 21, sm: 25 },
                }}
              >
                {projectContext.projectName}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25, fontWeight: 400 }}
              >
                Project-only conversation. Answers stay inside this project.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: 4,
            bgcolor: panelBg,
            borderColor: panelBorder,
            backdropFilter: isDark ? "blur(8px)" : "blur(10px)",
            boxShadow: isDark ? "0 14px 34px rgba(0, 0, 0, 0.4)" : "0 12px 30px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 2.25 },
              py: 1,
              bgcolor: infoBg,
              borderBottom: "1px solid",
              borderColor: panelBorder,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <InfoOutlinedIcon sx={{ fontSize: 17, color: "primary.main" }} />
              <Typography variant="body2" sx={{ fontWeight: 400, lineHeight: 1.5 }}>
                Project-only chat. Responses are generated from this project's database context.
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: { xs: 2, md: 2.25 },
              py: 1.5,
              bgcolor: "transparent",
            }}
          >
            <Stack spacing={1.5}>
              {apiError && (
                <Alert
                  severity="warning"
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    bgcolor: isDark ? "rgba(255, 193, 7, 0.08)" : undefined,
                  }}
                >
                  {apiError}
                </Alert>
              )}
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} pending={Boolean(message.pending)} />
              ))}
              {isThinking && !messages.some((message) => message.pending) && (
                <MessageBubble
                  message={{ role: "assistant", text: "", meta: "Client reply in progress" }}
                  pending
                />
              )}
              <div ref={messagesEndRef} />
            </Stack>
          </Box>

          <Divider />

          <Box
            sx={{
              px: { xs: 2, md: 2.25 },
              py: 1.25,
              bgcolor: infoBg,
              borderTop: "1px solid",
              borderColor: panelBorder,
            }}
          >
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {quickPrompts.map((prompt) => (
                  <Chip
                    key={prompt}
                    label={prompt}
                    onClick={() => handlePrompt(prompt)}
                    clickable
                    variant="outlined"
                    sx={{
                      fontWeight: 400,
                      bgcolor: chipBg,
                      borderColor: chipBorder,
                    }}
                  />
                ))}
              </Stack>
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  multiline
                  minRows={1}
                  maxRows={4}
                  placeholder="Ask about the project scope, status, members, or blockers..."
                  value={composer}
                  onChange={(event) => setComposer(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 3,
                      fontWeight: 400,
                      bgcolor: isDark ? "rgba(255,255,255,0.05)" : "background.paper",
                      borderColor: chipBorder,
                      py: 0.75,
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!composer.trim()}
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    border: "1px solid",
                    borderColor: chipBorder,
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "background.paper",
                  }}
                >
                  <SendOutlinedIcon />
                </IconButton>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: 15 }} />}
                  label="Project AI Chat"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 400, bgcolor: chipBg, borderColor: chipBorder }}
                />
                <Chip
                  icon={<LockOutlinedIcon sx={{ fontSize: 15 }} />}
                  label="Project only"
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 400, bgcolor: chipBg, borderColor: chipBorder }}
                />
                <Chip
                  label={`${projectContext.members} member${projectContext.members === 1 ? "" : "s"}`}
                  size="small"
                  icon={<GroupOutlinedIcon sx={{ fontSize: 15 }} />}
                  sx={{ fontWeight: 400, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "background.paper" }}
                />
                <Chip
                  label={hasClientRole ? "Project Client" : "Scoped member"}
                  size="small"
                  icon={<ShieldOutlinedIcon sx={{ fontSize: 15 }} />}
                  sx={{ fontWeight: 400, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "background.paper" }}
                />
              </Stack>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import DataObjectOutlinedIcon from "@mui/icons-material/DataObjectOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ModeCommentOutlinedIcon from "@mui/icons-material/ModeCommentOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import { resolveWorkspaceRole } from "../../../utils/workspaceRole.utils";

const CORE_MENTIONS = [
  { token: "@project", label: "Project", group: "Core", description: "Selected project summary and metadata" },
  { token: "@tasks", label: "Tasks", group: "Core", description: "Task list and status" },
  { token: "@comments", label: "Comments", group: "Core", description: "Recent discussion threads" },
  { token: "@stateHistory", label: "State History", group: "Core", description: "Workflow transitions and delays" },
  { token: "@members", label: "Members", group: "Core", description: "Project members" },
  { token: "@workflow", label: "Workflow", group: "Core", description: "Stages and transitions" },
  { token: "@categories", label: "Categories", group: "Core", description: "Task categories" },
];

const CONTEXT_GROUPS = [
  { key: "project", label: "Project", hint: "Current project summary" },
  { key: "tasks", label: "Tasks", hint: "Task list and status" },
  { key: "projectRoles", label: "Project Roles", hint: "Project role model entries" },
  { key: "comments", label: "Comments", hint: "Recent discussion threads" },
  { key: "stateHistory", label: "State History", hint: "Workflow transitions" },
  { key: "members", label: "Members", hint: "Project members" },
  { key: "workflow", label: "Workflow", hint: "Stages and transitions" },
  { key: "categories", label: "Categories", hint: "Task categories" },
];

const MODES = [
  { key: "ask", label: "Ask", icon: <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 17 }} /> },
  { key: "inspect", label: "Inspect", icon: <SearchOutlinedIcon sx={{ fontSize: 17 }} /> },
  { key: "plan", label: "Plan", icon: <RouteOutlinedIcon sx={{ fontSize: 17 }} /> },
];

const VIEW_ICONS = {
  chat: <ModeCommentOutlinedIcon sx={{ fontSize: 17 }} />,
  payload: <DataObjectOutlinedIcon sx={{ fontSize: 17 }} />,
};

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

function normalizeStringToken(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part, index) => {
      const clean = part.replace(/[^a-zA-Z0-9]/g, "");
      if (!clean) return "";
      if (index === 0) {
        return clean.charAt(0).toLowerCase() + clean.slice(1);
      }
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    })
    .join("");
}

function toMentionToken(value) {
  const token = normalizeStringToken(value);
  return token ? `@${token}` : null;
}

function getMentionQuery(text) {
  const match = text.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/);
  return match ? match[1].toLowerCase() : null;
}

function insertToken(text, token) {
  const trimmed = text.replace(/@[\w-]*$/, "").replace(/\s+$/, " ");
  return `${trimmed}${token} `;
}

function removeTokenBeforeCaret(text, caretIndex) {
  const beforeCaret = text.slice(0, caretIndex);
  const match = beforeCaret.match(/(?:^|\s)(@[a-zA-Z0-9_]+)\s*$/);
  if (!match) return null;

  const token = match[1];
  const tokenIndex = beforeCaret.lastIndexOf(token);
  if (tokenIndex < 0) return null;

  const removeStart = tokenIndex > 0 && beforeCaret[tokenIndex - 1] === " " ? tokenIndex - 1 : tokenIndex;
  const removeEnd = tokenIndex + token.length;
  const trailingSpace = text.slice(removeEnd).startsWith(" ") ? 1 : 0;

  return `${text.slice(0, removeStart)}${text.slice(removeEnd + trailingSpace)}`;
}

function Bubble({ role, text, meta, avatarLabel }) {
  const isUser = role === "user";

  return (
    <Stack
      direction="row"
      spacing={1.25}
      justifyContent={isUser ? "flex-end" : "flex-start"}
      alignItems="flex-start"
      sx={{ width: "100%" }}
    >
      {!isUser && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main", flexShrink: 0 }}>
          T
        </Avatar>
      )}
      <Box
        sx={{
          maxWidth: "82%",
          display: "flex",
          flexDirection: "column",
          alignItems: isUser ? "flex-end" : "flex-start",
        }}
      >
        <Box
          sx={{
            px: 1.5,
            py: 1.25,
            borderRadius: 3,
            bgcolor: isUser ? "primary.main" : "action.hover",
            color: isUser ? "primary.contrastText" : "text.primary",
            border: "1px solid",
            borderColor: isUser ? "primary.main" : "divider",
            whiteSpace: "pre-wrap",
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
            {text}
          </Typography>
        </Box>
        {meta && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
            {meta}
          </Typography>
        )}
      </Box>
      {isUser && (
        <Avatar sx={{ width: 30, height: 30, bgcolor: "secondary.main", flexShrink: 0 }}>
          {avatarLabel}
        </Avatar>
      )}
    </Stack>
  );
}

function MentionMenu({ title, items, activeIndex, onHoverIndex, onPick, emptyText = "No options" }) {
  return (
    <Box sx={{ minWidth: 320, maxWidth: 380, p: 0.75, bgcolor: "background.default" }}>
      <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: "block", px: 0.75, pb: 0.5 }}>
        {title}
      </Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 0.75, pb: 0.75 }}>
          {emptyText}
        </Typography>
      ) : (
        <List disablePadding dense sx={{ maxHeight: 300, overflowY: "auto" }}>
          {items.map((item, index) => (
            <ListItemButton
              key={item.token}
              selected={index === activeIndex}
              onMouseEnter={() => onHoverIndex(index)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(item.token)}
              sx={{
                mx: 0.5,
                my: 0.25,
                borderRadius: 1.5,
                "&.Mui-selected": {
                  bgcolor: "action.selected",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                <LocalOfferOutlinedIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary={item.label || item.token}
                secondary={item.description}
                primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: 11, color: "text.secondary" }}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
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

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectRoles, setProjectRoles] = useState([]);
  const [projectTasks, setProjectTasks] = useState([]);
  const [scope, setScope] = useState("project");
  const [selectedContexts, setSelectedContexts] = useState(["project", "tasks", "projectRoles"]);
  const [mode, setMode] = useState("ask");
  const [composer, setComposer] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "I am Trego Agent. Use the icons below the composer to change view, scope, project, mode, or insert context.",
      meta: "Ready to build context",
    },
  ]);
  const [activeView, setActiveView] = useState("chat");
  const [menuState, setMenuState] = useState({ anchorEl: null, type: null });
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
  const [activeMentionIndex, setActiveMentionIndex] = useState(0);

  const composerInputRef = useRef(null);
  const composerWrapRef = useRef(null);
  const mentionQuery = getMentionQuery(composer);

  useEffect(() => {
    if (!workspaceProjects.length) return;

    if (!selectedProject) {
      setSelectedProject(workspaceProjects[0]);
      return;
    }

    const exists = workspaceProjects.some((item) => String(item?._id) === String(selectedProject?._id));
    if (!exists) {
      setSelectedProject(workspaceProjects[0]);
    }
  }, [selectedProject, workspaceProjects]);

  useEffect(() => {
    let ignore = false;

    async function loadProjectContext() {
      if (!selectedProject?._id) {
        setProjectRoles([]);
        setProjectTasks([]);
        return;
      }

      try {
        const [rolesRes, tasksRes] = await Promise.all([
          callApi({
            method: "get",
            url: `/projects/${selectedProject._id}/roles`,
          }),
          callApi({
            method: "get",
            url: `/tasks/project/${selectedProject._id}`,
          }),
        ]);

        if (ignore) return;

        const roles = rolesRes?.data?.roles || rolesRes?.data || [];
        const tasks = tasksRes?.data?.data || tasksRes?.data?.tasks || tasksRes?.data?.items || tasksRes?.data || [];
        setProjectRoles(Array.isArray(roles) ? roles : []);
        setProjectTasks(Array.isArray(tasks) ? tasks : []);
      } catch (error) {
        if (!ignore) {
          console.error("Failed to load project context", error);
          setProjectRoles([]);
          setProjectTasks([]);
        }
      }
    }

    loadProjectContext();

    return () => {
      ignore = true;
    };
  }, [selectedProject?._id]);

  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const isWorkspaceAdmin = ["ADMIN", "OWNER"].includes(workspaceRole);
  const workspaceName = workspace?.name || workspace?.slug || "Workspace";
  const hasWorkspace = Boolean(workspace?.slug || workspace?.name || workspace?._id || workspace?.currentWorkspace);

  const roleMentions = useMemo(() => {
    return projectRoles
      .map((role) => {
        const token = toMentionToken(role?.name);
        return token ? { token, label: role?.name, description: "Project role" } : null;
      })
      .filter(Boolean);
  }, [projectRoles]);

  const taskMentions = useMemo(() => {
    return projectTasks
      .map((task) => {
        const token = toMentionToken(task?.title);
        return token ? { token, label: task?.title, description: task?.description || "Project task" } : null;
      })
      .filter(Boolean);
  }, [projectTasks]);

  const projectMentions = useMemo(() => {
    return workspaceProjects
      .map((project) => {
        const token = toMentionToken(project?.name);
        return token ? { token, label: project?.name, description: "Project document" } : null;
      })
      .filter(Boolean);
  }, [workspaceProjects]);

  const filteredMentionItems = useMemo(() => {
    const allItems = [
      ...CORE_MENTIONS,
      ...projectMentions,
      ...roleMentions,
      ...taskMentions,
    ];

    const unique = [];
    const seen = new Set();
    for (const item of allItems) {
      const key = item.token;
      if (!key || seen.has(key)) continue;
      seen.add(key);
      unique.push(item);
    }

    if (!mentionQuery) return unique;

    return unique.filter((item) => {
      const searchable = `${item.token} ${item.label} ${item.description}`.toLowerCase();
      return searchable.includes(mentionQuery);
    });
  }, [mentionQuery, projectMentions, roleMentions, taskMentions]);

  useEffect(() => {
    if (!mentionOpen) {
      setActiveMentionIndex(0);
      return;
    }

    setActiveMentionIndex((current) => {
      if (filteredMentionItems.length === 0) return 0;
      return Math.min(current, filteredMentionItems.length - 1);
    });
  }, [mentionOpen, filteredMentionItems.length]);

  const mentionItemsWithActive = useMemo(() => {
    return filteredMentionItems.map((item, index) => ({
      ...item,
      __active: index === activeMentionIndex,
    }));
  }, [filteredMentionItems, activeMentionIndex]);

  const payloadPreview = useMemo(() => {
    return {
      mode,
      scope,
      workspaceId: workspace?._id || null,
      workspaceSlug: workspace?.slug || null,
      projectId: selectedProject?._id || null,
      projectName: selectedProject?.name || null,
      contexts: selectedContexts,
      mentions: [...new Set((composer.match(/@[a-zA-Z0-9_]+/g) || []))],
      prompt: composer.trim() || null,
    };
  }, [composer, mode, scope, selectedContexts, selectedProject, workspace]);

  const openMenu = (event, type) => {
    setMenuState({ anchorEl: event.currentTarget, type });
  };

  const closeMenu = () => {
    setMenuState({ anchorEl: null, type: null });
  };

  const focusComposer = () => {
    requestAnimationFrame(() => {
      composerInputRef.current?.focus();
    });
  };

  const handleMentionPick = (token) => {
    setComposer((current) => insertToken(current, token));
    setMentionOpen(false);
    closeMenu();
    focusComposer();
  };

  const handleComposerChange = (value) => {
    setComposer(value);
    const query = getMentionQuery(value);
    setMentionOpen(query !== null);
    setMentionAnchorEl(composerWrapRef.current);
    setActiveMentionIndex(0);
  };

  const handleComposerKeyDown = (e) => {
    if (mentionOpen) {
      const hasItems = filteredMentionItems.length > 0;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!hasItems) return;
        setActiveMentionIndex((current) => (current + 1) % filteredMentionItems.length);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!hasItems) return;
        setActiveMentionIndex((current) => (current - 1 + filteredMentionItems.length) % filteredMentionItems.length);
        return;
      }

      if ((e.key === "Enter" || e.key === "Tab") && hasItems) {
        e.preventDefault();
        const activeItem = filteredMentionItems[activeMentionIndex] || filteredMentionItems[0];
        if (activeItem?.token) {
          handleMentionPick(activeItem.token);
        }
        return;
      }

      if (e.key === "Escape") {
        setMentionOpen(false);
        closeMenu();
        return;
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    if (e.key === "Backspace" && e.currentTarget.selectionStart === e.currentTarget.selectionEnd) {
      const { selectionStart, value } = e.currentTarget;
      const nextValue = removeTokenBeforeCaret(value, selectionStart);
      if (nextValue !== null) {
        e.preventDefault();
        setComposer(nextValue);
        setMentionOpen(getMentionQuery(nextValue) !== null);
        setActiveMentionIndex(0);
        requestAnimationFrame(() => {
          const nextCaret = Math.max(0, selectionStart - 1);
          composerInputRef.current?.setSelectionRange?.(nextCaret, nextCaret);
          composerInputRef.current?.focus();
        });
      }
    }
  };

  const toggleContext = (key) => {
    setSelectedContexts((current) => (
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    ));
  };

  const handleSend = () => {
    const prompt = composer.trim();
    if (!prompt) return;

    const stamp = Date.now();
    const payload = {
      mode,
      scope,
      workspaceId: workspace?._id || null,
      workspaceSlug: workspace?.slug || null,
      projectId: selectedProject?._id || null,
      projectName: selectedProject?.name || null,
      contexts: selectedContexts,
      mentions: [...new Set((composer.match(/@[a-zA-Z0-9_]+/g) || []))],
      prompt,
    };

    setMessages((current) => [
      ...current,
      {
        id: `${stamp}-user`,
        role: "user",
        text: prompt,
        meta: selectedProject?.name || workspaceName,
      },
      {
        id: `${stamp}-assistant`,
        role: "assistant",
        text: "Structured payload captured. The backend can now hydrate context from the selected scope and mentions.",
        meta: JSON.stringify(payload, null, 2),
      },
    ]);

    setComposer("");
    setMentionOpen(false);
    closeMenu();
    focusComposer();
  };

  const activeViewLabel = activeView === "chat" ? "Chat" : "Payload";

  const renderMenuContent = () => {
    if (menuState.type === "scope") {
      return (
        <Box sx={{ minWidth: 240, p: 0.5, bgcolor: "background.default" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: "block", mb: 0.75 }}>
            Scope
          </Typography>
          <List dense disablePadding>
            {["project", "workspace", "all-projects"].map((item) => {
              const active = scope === item;
              return (
                <ListItemButton
                  key={item}
                  selected={active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setScope(item);
                    closeMenu();
                    focusComposer();
                  }}
                  sx={{
                    borderRadius: 1.5,
                    mx: 0,
                    my: 0.25,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: active ? "primary.main" : "text.secondary" }}>
                    <RouteOutlinedIcon sx={{ fontSize: 17 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item === "project" ? "Current Project" : item === "workspace" ? "Workspace" : "All Projects"}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 700 : 500 }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      );
    }

    if (menuState.type === "project") {
      return (
        <Box sx={{ minWidth: 280, maxWidth: 360, p: 0.5, bgcolor: "background.default" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: "block", mb: 0.75 }}>
            Project
          </Typography>
          <List dense disablePadding sx={{ maxHeight: 300, overflowY: "auto" }}>
            {workspaceProjects.map((project) => {
              const active = String(project._id) === String(selectedProject?._id);
              return (
                <ListItemButton
                  key={project._id}
                  selected={active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setSelectedProject(project);
                    closeMenu();
                    focusComposer();
                  }}
                  sx={{
                    borderRadius: 1.5,
                    mx: 0,
                    my: 0.25,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: active ? "primary.main" : "text.secondary" }}>
                    <WorkOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.name}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 700 : 500 }}
                  />
                </ListItemButton>
              );
            })}
            {workspaceProjects.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 0.75 }}>
                No projects available.
              </Typography>
            )}
          </List>
        </Box>
      );
    }

    if (menuState.type === "mode") {
      return (
        <Box sx={{ minWidth: 220, p: 0.5, bgcolor: "background.default" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: "block", mb: 0.75 }}>
            Mode
          </Typography>
          <List dense disablePadding>
            {MODES.map((item) => {
              const active = mode === item.key;
              return (
                <ListItemButton
                  key={item.key}
                  selected={active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setMode(item.key);
                    closeMenu();
                    focusComposer();
                  }}
                  sx={{
                    borderRadius: 1.5,
                    mx: 0,
                    my: 0.25,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: active ? "primary.main" : "text.secondary" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 700 : 500 }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      );
    }

    if (menuState.type === "context") {
      return (
        <Box sx={{ minWidth: 340, maxWidth: 420, p: 0.5, bgcolor: "background.default" }}>
          <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ display: "block", mb: 0.75 }}>
            Context
          </Typography>

          <Stack spacing={1} sx={{ maxHeight: 340, overflowY: "auto" }}>
            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 0.25, px: 0.5 }}>
                Project Context
              </Typography>
              <List dense disablePadding>
                {CONTEXT_GROUPS.map((item) => {
                  const active = selectedContexts.includes(item.key);
                  return (
                    <ListItemButton
                      key={item.key}
                      selected={active}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleContext(item.key)}
                      sx={{
                        borderRadius: 1.5,
                        mx: 0,
                        my: 0.25,
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 28, color: active ? "primary.main" : "text.secondary" }}>
                        <LocalOfferOutlinedIcon sx={{ fontSize: 17 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.label}
                        secondary={item.hint}
                        primaryTypographyProps={{ fontSize: 13, fontWeight: active ? 700 : 500 }}
                        secondaryTypographyProps={{ fontSize: 11, color: "text.secondary" }}
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 0.25, px: 0.5 }}>
                Projects
              </Typography>
              <List dense disablePadding>
                {projectMentions.length > 0 ? projectMentions.slice(0, 20).map((item) => (
                  <ListItemButton
                    key={item.token}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleMentionPick(item.token)}
                    sx={{ borderRadius: 1.5, mx: 0, my: 0.25 }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                      <WorkOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.token}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: 11, color: "text.secondary" }}
                    />
                  </ListItemButton>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
                    No projects found.
                  </Typography>
                )}
              </List>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 0.25, px: 0.5 }}>
                Project Roles
              </Typography>
              <List dense disablePadding>
                {roleMentions.length > 0 ? roleMentions.map((item) => (
                  <ListItemButton
                    key={item.token}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleMentionPick(item.token)}
                    sx={{ borderRadius: 1.5, mx: 0, my: 0.25 }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                      <LocalOfferOutlinedIcon sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.token}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: 11, color: "text.secondary" }}
                    />
                  </ListItemButton>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
                    No project roles found.
                  </Typography>
                )}
              </List>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 0.25, px: 0.5 }}>
                Tasks
              </Typography>
              <List dense disablePadding>
                {taskMentions.length > 0 ? taskMentions.slice(0, 20).map((item) => (
                  <ListItemButton
                    key={item.token}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleMentionPick(item.token)}
                    sx={{ borderRadius: 1.5, mx: 0, my: 0.25 }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                      <DataObjectOutlinedIcon sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.token}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: 11, color: "text.secondary" }}
                    />
                  </ListItemButton>
                )) : (
                  <Typography variant="body2" color="text.secondary" sx={{ px: 0.5 }}>
                    No tasks found.
                  </Typography>
                )}
              </List>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ display: "block", mb: 0.25, px: 0.5 }}>
                Core
              </Typography>
              <List dense disablePadding>
                {CORE_MENTIONS.map((item) => (
                  <ListItemButton
                    key={item.token}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleMentionPick(item.token)}
                    sx={{ borderRadius: 1.5, mx: 0, my: 0.25 }}
                  >
                    <ListItemIcon sx={{ minWidth: 28, color: "text.secondary" }}>
                      <DataObjectOutlinedIcon sx={{ fontSize: 17 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={item.token}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: 500 }}
                      secondaryTypographyProps={{ fontSize: 11, color: "text.secondary" }}
                    />
                  </ListItemButton>
                ))}
              </List>
            </Box>
          </Stack>
        </Box>
      );
    }

    return null;
  };

  return (
    <Box
      sx={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Box sx={{ px: 0.25, pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeOutlinedIcon sx={{ color: "primary.main", fontSize: 20 }} />
            <Typography variant="subtitle2" fontWeight={800}>
              Trego Agent
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {activeViewLabel}
          </Typography>
        </Stack>
      </Box>

      {!hasWorkspace ? (
        <Alert severity="info">Workspace context is still loading.</Alert>
      ) : !isWorkspaceAdmin ? (
        <Alert severity="warning">The Trego Agent is available only for workspace admins and owners.</Alert>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              pr: 0.5,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {activeView === "chat" ? (
              <Stack spacing={1.5} sx={{ pb: 1 }}>
                {messages.map((message) => (
                  <Bubble
                    key={message.id}
                    role={message.role}
                    text={message.text}
                    meta={message.meta}
                    avatarLabel={authUser?.name?.[0] || "U"}
                  />
                ))}
              </Stack>
            ) : (
              <Box
                component="pre"
                sx={{
                  m: 0,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
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

          <Box sx={{ pt: 1.25 }} ref={composerWrapRef}>
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={7}
              value={composer}
              inputRef={composerInputRef}
              onChange={(e) => handleComposerChange(e.target.value)}
              placeholder="Ask Trego Agent anything. Type @ to insert context tokens."
              onKeyDown={handleComposerKeyDown}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  alignItems: "flex-end",
                  bgcolor: "background.default",
                  pr: 0.75,
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
                "& .MuiInputBase-inputMultiline": {
                  py: 1.25,
                  lineHeight: 1.6,
                  overflow: "auto",
                },
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!composer.trim()}
                    sx={{
                      ml: 1,
                      mb: 0.25,
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: (theme) => theme.palette.primary.main,
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.dark" },
                      "&.Mui-disabled": {
                        bgcolor: "action.disabledBackground",
                        color: "action.disabled",
                      },
                    }}
                  >
                    <SendOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                ),
              }}
            />

            {mentionOpen && (
              <Popover
                open={mentionOpen}
                anchorEl={mentionAnchorEl}
                onClose={() => setMentionOpen(false)}
                disableAutoFocus
                disableEnforceFocus
                disableRestoreFocus
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                  sx: {
                    bgcolor: "background.default",
                  backgroundImage: "none",
                  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
                  border: "0",
                  borderRadius: 2,
                  overflow: "hidden",
                },
              }}
            >
                <Box onMouseDown={(e) => e.preventDefault()}>
                  <MentionMenu
                    title="Context suggestions"
                    items={mentionItemsWithActive}
                    activeIndex={activeMentionIndex}
                    onHoverIndex={setActiveMentionIndex}
                    onPick={handleMentionPick}
                    emptyText="No matching context found"
                  />
                </Box>
              </Popover>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1, mt: 1 }}>
              <Tooltip title={activeView === "chat" ? "Chat view" : "Switch to chat"}>
                <IconButton
                  onClick={() => setActiveView("chat")}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: activeView === "chat" ? "primary.main" : "divider",
                    color: activeView === "chat" ? "primary.main" : "text.secondary",
                    bgcolor: activeView === "chat" ? "action.hover" : "transparent",
                  }}
                >
                  {VIEW_ICONS.chat}
                </IconButton>
              </Tooltip>

              <Tooltip title={activeView === "payload" ? "Payload view" : "Switch to payload"}>
                <IconButton
                  onClick={() => setActiveView("payload")}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: activeView === "payload" ? "primary.main" : "divider",
                    color: activeView === "payload" ? "primary.main" : "text.secondary",
                    bgcolor: activeView === "payload" ? "action.hover" : "transparent",
                  }}
                >
                  {VIEW_ICONS.payload}
                </IconButton>
              </Tooltip>

              <Tooltip title="Scope">
                <IconButton
                  onClick={(e) => openMenu(e, "scope")}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: menuState.type === "scope" ? "primary.main" : "divider",
                    color: menuState.type === "scope" ? "primary.main" : "text.secondary",
                  }}
                >
                  <RouteOutlinedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Project">
                <IconButton
                  onClick={(e) => openMenu(e, "project")}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: menuState.type === "project" ? "primary.main" : "divider",
                    color: menuState.type === "project" ? "primary.main" : "text.secondary",
                  }}
                >
                  <WorkOutlineOutlinedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Context">
                <IconButton
                  onClick={(e) => openMenu(e, "context")}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: menuState.type === "context" ? "primary.main" : "divider",
                    color: menuState.type === "context" ? "primary.main" : "text.secondary",
                  }}
                >
                  <LocalOfferOutlinedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Mode">
                <IconButton
                  onClick={(e) => openMenu(e, "mode")}
                  size="small"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: menuState.type === "mode" ? "primary.main" : "divider",
                    color: menuState.type === "mode" ? "primary.main" : "text.secondary",
                  }}
                >
                  <TuneOutlinedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      )}

      <Popover
        open={Boolean(menuState.type)}
        anchorEl={menuState.anchorEl}
        onClose={closeMenu}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            bgcolor: "background.default",
            backgroundImage: "none",
            boxShadow: "0 18px 40px rgba(15, 23, 42, 0.12)",
            border: "0",
            borderRadius: 2,
            overflow: "hidden",
          },
        }}
      >
        <Box onMouseDown={(e) => e.preventDefault()}>
          {renderMenuContent()}
        </Box>
      </Popover>
    </Box>
  );
}

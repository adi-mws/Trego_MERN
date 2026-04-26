import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";

import { useNotification } from "../../../hooks/useNotification";
import { useNotificationsDrawer } from "../../../contexts/NotificationDrawerContext";
import { useNavigate } from "react-router-dom";
import { useSocketEvent } from "../../../lib/socket";

const ICON_META = {
  LOGIN: {
    icon: LoginOutlinedIcon,
    color: "success.main",
    bgcolor: "success.lighter",
  },
  LOGOUT: {
    icon: LogoutOutlinedIcon,
    color: "warning.main",
    bgcolor: "warning.lighter",
  },
  TASK: {
    icon: TaskAltOutlinedIcon,
    color: "primary.main",
    bgcolor: "primary.lighter",
  },
  PROJECT: {
    icon: AccountTreeOutlinedIcon,
    color: "secondary.main",
    bgcolor: "secondary.lighter",
  },
  WORKFLOW: {
    icon: CheckCircleOutlineIcon,
    color: "info.main",
    bgcolor: "info.lighter",
  },
  ALERT: {
    icon: WarningAmberOutlinedIcon,
    color: "error.main",
    bgcolor: "error.lighter",
  },
  SYSTEM: {
    icon: NotificationsActiveOutlinedIcon,
    color: "text.secondary",
    bgcolor: "action.hover",
  },
  INFO: {
    icon: InfoOutlinedIcon,
    color: "info.main",
    bgcolor: "info.lighter",
  },
};

function getIconMeta(notification) {
  return ICON_META[notification?.iconKey] || ICON_META[notification?.type] || ICON_META.INFO;
}

function formatTime(value) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return "";
  }
}

function sortByNewest(items = []) {
  return [...items].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function groupNotifications(notifications = []) {
  const sorted = sortByNewest(notifications);
  const systemNotifications = [];
  const workspaceMap = new Map();

  for (const notif of sorted) {
    const isSystem = notif.scopeType === "ACCOUNT" || !notif.workspaceId;

    if (isSystem) {
      systemNotifications.push(notif);
      continue;
    }

    const workspaceId = String(notif.workspaceId || notif.scopeId || "");
    if (!workspaceId) continue;

    if (!workspaceMap.has(workspaceId)) {
      workspaceMap.set(workspaceId, {
        workspaceId,
        workspaceName: notif.workspaceName || "Workspace",
        workspaceSlug: notif.workspaceSlug || "",
        latestAt: notif.createdAt,
        workspaceNotifications: [],
        projectMap: new Map(),
      });
    }

    const workspaceGroup = workspaceMap.get(workspaceId);
    if (new Date(notif.createdAt) > new Date(workspaceGroup.latestAt)) {
      workspaceGroup.latestAt = notif.createdAt;
    }

    if (notif.projectId) {
      const projectId = String(notif.projectId);

      if (!workspaceGroup.projectMap.has(projectId)) {
        workspaceGroup.projectMap.set(projectId, {
          projectId,
          projectName: notif.projectName || "Project",
          projectSlug: notif.projectSlug || "",
          latestAt: notif.createdAt,
          items: [],
        });
      }

      const projectGroup = workspaceGroup.projectMap.get(projectId);
      projectGroup.items.push(notif);
      if (new Date(notif.createdAt) > new Date(projectGroup.latestAt)) {
        projectGroup.latestAt = notif.createdAt;
      }
    } else {
      workspaceGroup.workspaceNotifications.push(notif);
    }
  }

  const workspaceGroups = [...workspaceMap.values()]
    .map((workspaceGroup) => {
      const projects = [...workspaceGroup.projectMap.values()]
        .map((projectGroup) => ({
          ...projectGroup,
          items: sortByNewest(projectGroup.items),
        }))
        .sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt));

      return {
        ...workspaceGroup,
        workspaceNotifications: sortByNewest(workspaceGroup.workspaceNotifications),
        projects,
        totalCount:
          workspaceGroup.workspaceNotifications.length +
          projects.reduce((sum, project) => sum + project.items.length, 0),
      };
    })
    .sort((a, b) => new Date(b.latestAt) - new Date(a.latestAt));

  return {
    systemNotifications,
    workspaceGroups,
  };
}

function NotificationCard({ notif, fading, onOpen, onClear }) {
  const meta = getIconMeta(notif);
  const Icon = meta.icon;
  const subtitle = notif.toastMessage || notif.message;

  return (
    <Box
      px={1.5}
      py={1.25}
      onClick={() => onOpen(notif)}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        backgroundColor: notif.isRead ? "background.paper" : "action.hover",
        cursor: "pointer",
        opacity: fading ? 0.3 : notif.isRead ? 0.9 : 1,
        transform: fading ? "translateX(8px)" : "translateX(0)",
        transition: "opacity 180ms ease, transform 180ms ease, background-color 180ms ease",
        "&:hover": { backgroundColor: "action.selected" },
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          src={notif.image || notif.triggeredBy?.avatar}
          sx={{
            width: 38,
            height: 38,
            bgcolor: meta.bgcolor,
            color: meta.color,
          }}
        >
          <Icon sx={{ fontSize: 19 }} />
        </Avatar>

        <Box flex={1}>
          <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
            <Typography fontSize={13} fontWeight={700}>
              {notif.title}
            </Typography>
            <Chip
              size="small"
              label={notif.projectName || notif.workspaceName || notif.iconKey || notif.type}
              sx={{ height: 20, fontSize: 10 }}
              variant="outlined"
            />
          </Stack>

          <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mt={0.25}>
            {notif.triggeredBy?.name && (
              <Typography fontSize={10.5} color="text.disabled">
                {notif.triggeredBy.name}
              </Typography>
            )}
            <Typography fontSize={10} color="text.disabled">
              {formatTime(notif.createdAt)}
            </Typography>
          </Stack>
        </Box>

        {!notif.isRead && (
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: "primary.main",
              flexShrink: 0,
            }}
          />
        )}

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onClear(notif._id);
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
}

export default function NotificationsDrawer() {
  const { open, closeDrawer } = useNotificationsDrawer();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading, data: authData } = useSelector(
    (state) => state.auth
  );
  const currentSessionId = authData?.currentSessionId || authData?.sessionId || null;
  const openRef = useRef(open);
  const clearingTimersRef = useRef(new Map());
  const [clearingIds, setClearingIds] = useState(() => new Set());
  const socketReady = !authLoading && isAuthenticated && authData?._id && currentSessionId;

  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAllNotifications,
    addNotification,
  } = useNotification();

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!socketReady) {
      return undefined;
    }

    void (async () => {
      await fetchNotifications();
      if (openRef.current) {
        await markAllAsRead();
      }
    })();

    return undefined;
  }, [
    authData?._id,
    authLoading,
    fetchNotifications,
    currentSessionId,
    markAllAsRead,
    isAuthenticated,
    socketReady,
  ]);

  const handleNotification = (notif) => {
    if (!notif?._id) return;

    if (
      notif.sourceSessionId &&
      currentSessionId &&
      String(notif.sourceSessionId) === String(currentSessionId)
    ) {
      return;
    }

    if (openRef.current) {
      addNotification({ ...notif, isRead: true });
      void markAsRead(notif._id);
      return;
    }

    addNotification(notif);
  };

  useSocketEvent("notification:new", handleNotification, socketReady);

  useEffect(() => {
    if (!open || authLoading || !isAuthenticated || !currentSessionId) {
      return;
    }

    void markAllAsRead();
  }, [authLoading, currentSessionId, isAuthenticated, markAllAsRead, open]);

  useEffect(() => {
    const timers = clearingTimersRef.current;

    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  const groupedNotifications = useMemo(
    () => groupNotifications(notifications),
    [notifications]
  );

  const handleClick = async (notif) => {
    if (notif.link) {
      navigate(notif.link);
    }

    await markAsRead(notif._id);
  };

  const handleClear = async (notificationId) => {
    if (!notificationId || clearingIds.has(notificationId)) return;

    setClearingIds((prev) => new Set(prev).add(notificationId));

    const timer = setTimeout(async () => {
      clearingTimersRef.current.delete(notificationId);

      const res = await clearNotification(notificationId);
      if (!res.success) {
        setClearingIds((prev) => {
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
        return;
      }

      setClearingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }, 180);

    clearingTimersRef.current.set(notificationId, timer);
  };

  const systemCount = groupedNotifications.systemNotifications.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={closeDrawer}
      ModalProps={{ BackdropProps: { invisible: true } }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxWidth: "100vw",
            height: "100vh",
            borderLeft: "1px solid",
            borderColor: "divider",
          },
        },
      }}
    >
      {/* Header */}
      <Box px={2} py={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography fontSize={14} fontWeight={600}>
              Notifications
            </Typography>
            <Typography fontSize={11} color="text.secondary">
              {unreadCount} unread
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button size="small" onClick={clearAllNotifications}>
              Clear all
            </Button>

            <IconButton size="small" onClick={closeDrawer}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      </Box>

      <Divider />

      {/* Content */}
      <Box flex={1} overflow="auto" p={1.5}>
        {notifications.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography fontSize={13} color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {systemCount > 0 && (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography fontSize={12} fontWeight={700} color="text.secondary">
                    System
                  </Typography>
                  <Chip size="small" label={systemCount} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                </Stack>

                <Stack spacing={1}>
                  {groupedNotifications.systemNotifications.map((notif) => (
                    <NotificationCard
                      key={notif._id}
                      notif={notif}
                      fading={clearingIds.has(notif._id)}
                      onOpen={handleClick}
                      onClear={handleClear}
                    />
                  ))}
                </Stack>
              </Box>
            )}

            {groupedNotifications.workspaceGroups.map((workspaceGroup) => (
              <Accordion
                key={workspaceGroup.workspaceId}
                defaultExpanded
                disableGutters
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  "&:before": { display: "none" },
                  overflow: "hidden",
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                    <Box>
                      <Typography fontSize={13} fontWeight={700}>
                        {workspaceGroup.workspaceName}
                      </Typography>
                      <Typography fontSize={11} color="text.secondary">
                        {workspaceGroup.totalCount} notification{workspaceGroup.totalCount === 1 ? "" : "s"}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={workspaceGroup.totalCount}
                      variant="outlined"
                      sx={{ height: 20, fontSize: 10, mr: 1 }}
                    />
                  </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>
                  <Stack spacing={1.25}>
                    {workspaceGroup.workspaceNotifications.length > 0 && (
                      <Stack spacing={1}>
                        {workspaceGroup.workspaceNotifications.map((notif) => (
                          <NotificationCard
                            key={notif._id}
                            notif={notif}
                            fading={clearingIds.has(notif._id)}
                            onOpen={handleClick}
                            onClear={handleClear}
                          />
                        ))}
                      </Stack>
                    )}

                    {workspaceGroup.projects.map((projectGroup) => (
                      <Box
                        key={projectGroup.projectId}
                        sx={{
                          pl: 1.25,
                          ml: 0.5,
                          borderLeft: "2px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                          <Typography fontSize={12.5} fontWeight={700}>
                            {projectGroup.projectName}
                          </Typography>
                          <Chip
                            size="small"
                            label={projectGroup.items.length}
                            variant="outlined"
                            sx={{ height: 20, fontSize: 10 }}
                          />
                        </Stack>

                        <Stack spacing={1}>
                          {projectGroup.items.map((notif) => (
                            <NotificationCard
                              key={notif._id}
                              notif={notif}
                              fading={clearingIds.has(notif._id)}
                              onOpen={handleClick}
                              onClear={handleClear}
                            />
                          ))}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Box>

    </Drawer>
  );
}

import { useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  Button,
  Divider,
} from "@mui/material";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { useHeader } from "../../../contexts/HeaderContext";
import { useNotification } from "../../../hooks/useNotification";

const ICON_META = {
  LOGIN: { icon: LoginOutlinedIcon, color: "success.main", bgcolor: "success.lighter" },
  LOGOUT: { icon: LogoutOutlinedIcon, color: "warning.main", bgcolor: "warning.lighter" },
  TASK: { icon: TaskAltOutlinedIcon, color: "primary.main", bgcolor: "primary.lighter" },
  PROJECT: { icon: AccountTreeOutlinedIcon, color: "secondary.main", bgcolor: "secondary.lighter" },
  WORKFLOW: { icon: CheckCircleOutlineIcon, color: "info.main", bgcolor: "info.lighter" },
  ALERT: { icon: WarningAmberOutlinedIcon, color: "error.main", bgcolor: "error.lighter" },
  SYSTEM: { icon: NotificationsActiveOutlinedIcon, color: "text.secondary", bgcolor: "action.hover" },
  INFO: { icon: InfoOutlinedIcon, color: "info.main", bgcolor: "info.lighter" },
};

function getIconMeta(notification) {
  return ICON_META[notification?.iconKey] || ICON_META[notification?.type] || ICON_META.INFO;
}

export default function NotificationsPage() {
  const { setHeaderTitle } = useHeader();
  const {
    notifications,
    fetchNotifications,
    clearNotification,
    markAsRead,
    markAllAsRead,
  } = useNotification();

  useEffect(() => {
    setHeaderTitle("Notifications");
    void (async () => {
      await fetchNotifications();
      await markAllAsRead();
    })();

    return () => setHeaderTitle("");
  }, [fetchNotifications, markAllAsRead, setHeaderTitle]);

  return (
    <Box p={3}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {notifications.length} recent notifications
          </Typography>
        </Box>

        <Button variant="outlined" size="small" onClick={() => fetchNotifications()}>
          Refresh
        </Button>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      {notifications.length === 0 ? (
        <Box py={6} textAlign="center">
          <Typography fontSize={14} color="text.secondary">
            You’re all caught up.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {notifications.map((notif) => {
            const meta = getIconMeta(notif);
            const Icon = meta.icon;

            return (
              <Box
                key={notif._id}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: notif.isRead ? "background.paper" : "action.hover",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={notif.image || notif.triggeredBy?.avatar}
                    sx={{ width: 38, height: 38, bgcolor: meta.bgcolor, color: meta.color }}
                  >
                    <Icon sx={{ fontSize: 19 }} />
                  </Avatar>

                  <Box flex={1}>
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                      <Typography fontWeight={700} fontSize={14}>
                        {notif.title}
                      </Typography>
                      <Chip size="small" label={notif.iconKey || notif.type} variant="outlined" sx={{ height: 20, fontSize: 10 }} />
                    </Stack>

                    <Typography variant="body2" color="text.secondary" mt={0.25}>
                      {notif.toastMessage || notif.message}
                    </Typography>

                    <Stack direction="row" spacing={1} mt={0.25} alignItems="center" flexWrap="wrap">
                      {notif.triggeredBy?.name && (
                        <Typography variant="caption" color="text.disabled">
                          {notif.triggeredBy.name}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        {new Date(notif.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Box>

                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {!notif.isRead && (
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main" }} />
                    )}
                    <Button size="small" onClick={() => markAsRead(notif._id)}>
                      Mark read
                    </Button>
                    <Button size="small" color="error" onClick={() => clearNotification(notif._id)}>
                      Clear
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

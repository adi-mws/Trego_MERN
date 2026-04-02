import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { useNotification } from "../../../hooks/useNotification";
import { useNotificationsDrawer } from "../../../contexts/NotificationDrawerContext";
import { useNavigate } from "react-router-dom";

export default function NotificationsDrawer() {
  const { open, closeDrawer } = useNotificationsDrawer();
  const navigate = useNavigate();

  const {
    notifications,
    unreadCount,
    clearNotification,
    clearAllNotifications,
  } = useNotification();

  const handleClick = (notif) => {
    // Navigate if link exists
    if (notif.link) {
      navigate(notif.link);
    }

    // Remove notification
    clearNotification(notif._id);
  };

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
      <Box flex={1} overflow="auto">
        {notifications.length === 0 ? (
          <Box py={6} textAlign="center">
            <Typography fontSize={13} color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          notifications.map((notif) => (
            <Box
              key={notif._id}
              px={2}
              py={1.5}
              onClick={() => handleClick(notif)}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundColor: notif.isRead ? "transparent" : "action.hover",
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.selected" },
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                {/* Avatar */}
                <Avatar
                  src={notif.image || notif.triggeredBy?.avatar}
                  sx={{ width: 36, height: 36 }}
                >
                  {notif.title?.[0]}
                </Avatar>

                {/* Content */}
                <Box flex={1}>
                  <Typography fontSize={13} fontWeight={600}>
                    {notif.title}
                  </Typography>

                  <Typography fontSize={12} color="text.secondary">
                    {notif.message}
                  </Typography>

                  <Typography fontSize={10} color="text.disabled">
                    {new Date(notif.createdAt).toLocaleString()}
                  </Typography>
                </Box>

                {/* Replace menu with close icon */}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // prevent triggering navigation
                    clearNotification(notif._id);
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))
        )}
      </Box>
    </Drawer>
  );
}
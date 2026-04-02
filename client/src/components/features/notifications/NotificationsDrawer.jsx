import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useState } from "react";
import { useNotifications } from "../../../../hooks/useNotifications";

export default function NotificationsDrawer({ open, onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    clearNotification,
    clearAllNotifications,
  } = useNotifications();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const openMenu = (e, id) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedId(id);
  };

  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
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

            <IconButton size="small" onClick={onClose}>
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
              onClick={() => markAsRead(notif._id)}
              sx={{
                borderBottom: "1px solid",
                borderColor: "divider",
                backgroundColor: notif.isRead ? "transparent" : "action.hover",
                cursor: "pointer",
                "&:hover": { backgroundColor: "action.selected" },
              }}
            >
              <Stack direction="row" spacing={1.5}>
                <Avatar
                  src={notif.image || notif.triggeredBy?.avatar}
                  sx={{ width: 36, height: 36 }}
                >
                  {notif.title?.[0]}
                </Avatar>

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

                {/* Menu */}
                <IconButton
                  size="small"
                  onClick={(e) => openMenu(e, notif._id)}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          ))
        )}
      </Box>

      {/* Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            markAsRead(selectedId);
            closeMenu();
          }}
        >
          Mark as read
        </MenuItem>

        <MenuItem
          onClick={() => {
            clearNotification(selectedId);
            closeMenu();
          }}
        >
          Clear
        </MenuItem>
      </Menu>
    </Drawer>
  );
}
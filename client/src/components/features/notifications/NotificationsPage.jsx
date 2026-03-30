import * as React from "react";
import {
  Box,
  MenuItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link } from "react-router-dom";

const STATIC_NOTIFICATIONS = [
  {
    id: "1",
    title: "New message",
    description: "You received a message from John",
    time: "2m ago",
    icon: "💬",
    href: "/messages/123",
  },
  {
    id: "2",
    title: "Workspace updated",
    description: "Design files were updated",
    time: "1h ago",
    icon: "📁",
    href: "/workspaces/design",
  },
  {
    id: "3",
    title: "Deployment successful",
    description: "Your app was deployed to production",
    time: "Yesterday",
    icon: "🚀",
  },
];


export default function NotificationPage() {
  const [notifications, setNotifications] =
    React.useState(STATIC_NOTIFICATIONS);

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (notifications.length === 0) {
    return (
      <Box p={3} textAlign="center">
        <Typography fontSize={14} color="text.secondary">
          You’re all caught up 🎉
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {notifications.map((n) => {
        const content = (
          <MenuItem
            key={n.id}
            sx={{
              alignItems: "flex-start",
              py: 1.2,
              gap: 1,
              position: "relative",
              "&:hover .dismiss-btn": {
                opacity: 1,
              },
            }}
          >
            {/* Avatar / Icon */}
            <ListItemAvatar>
              {n.avatar ? (
                <Avatar src={n.avatar} sx={{ width: 40, height: 40 }} />
              ) : (
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: "background.default",
                    color: "text.secondary",
                    fontSize: 18,
                  }}
                >
                  {n.icon}
                </Avatar>
              )}
            </ListItemAvatar>

            {/* Text */}
            <ListItemText
              primary={
                <Typography fontWeight={600} fontSize={14}>
                  {n.title}
                </Typography>
              }
              secondary={
                <>
                  <Typography fontSize={13} component={"span"}>
                    {n.description}
                  </Typography>

                  <Typography
                    component={"span"}
                    fontSize={12}
                    mt={0.3}
                    color="text.secondary"
                  >
                    {n.time}
                  </Typography>
                </>
              }
            />

            {/* Dismiss */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                dismiss(n.id);
              }}
              className="dismiss-btn"
              sx={{
                position: "absolute",
                top: 6,
                right: 4,
                color: "text.secondary",
                opacity: 0,
                transition: "opacity 0.15s ease",
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </MenuItem>
        );

        // Wrap with link if href exists
        return n.href ? (
          <Link
            key={n.id}
            href={n.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {content}
          </Link>
        ) : (
          content
        );
      })}
    </Box>
  );
}

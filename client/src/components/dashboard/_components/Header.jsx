"use client";

import { AppBar, Toolbar, Box, IconButton } from "@mui/material";
import UserMenu from "@/components/features/account/UserMenu";
import GlobalSearchBar from "@/components/layout/app/GlobalSearchBar";
import { NotificationsOutlined } from "@mui/icons-material";

export default function Header({
  openNotificationDrawer,
  headerTitle,
  headerRightActions,
}) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        // borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(6px)",
      }}
    >
      <Toolbar
        sx={{
          minHeight: 64,
          px: 3,
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* Left: route-specific header content */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {headerTitle}
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right: global actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GlobalSearchBar />
          {headerRightActions}
          {/* Notifications */}
          <IconButton
            onClick={() => openNotificationDrawer(true)}
            size="large"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <NotificationsOutlined sx={{ fontSize: 22 }} />
          </IconButton>

          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

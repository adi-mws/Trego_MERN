
import { AppBar, Toolbar, Box, IconButton } from "@mui/material";
import { Inbox, InboxOutlined, NotificationsOutlined } from "@mui/icons-material";
import GlobalSearchBar from "./GlobalSearchBar";
import UserMenu from "../../features/account/UserMenu";
import { useNotificationsDrawer } from "../../../contexts/NotificationDrawerContext";
import { useHeader } from "../../../contexts/HeaderContext";
export default function Header() {
  const { headerTitle, headerRightActions, headerLeftContent } = useHeader();
  const { openDrawer } = useNotificationsDrawer();
  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {headerTitle}
          {headerLeftContent && <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>{headerLeftContent}</Box>}

        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right: global actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <GlobalSearchBar />
          {headerRightActions}
          {/* Notifications */}
          <IconButton
            onClick={() => openDrawer()}
            size="medium"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <InboxOutlined sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            onClick={() => openDrawer()}
            size="medium"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <NotificationsOutlined sx={{ fontSize: 20 }} />
          </IconButton>


          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}

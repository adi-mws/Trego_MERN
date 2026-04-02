
import { AppBar, Toolbar, Box, IconButton } from "@mui/material";
import { NotificationsOutlined } from "@mui/icons-material";
import GlobalSearchBar from "./GlobalSearchBar";
import UserMenu from "../../features/account/UserMenu";
import { useNotificationsDrawer } from "../../../contexts/NotificationDrawerContext";
export default function Header({
  headerTitle,
  headerRightActions,
}) {
  const { openDrawer } = useNotificationsDrawer();
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
            onClick={() => openDrawer()}
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

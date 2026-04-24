
import { AppBar, Toolbar, Box, IconButton, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AutoAwesomeOutlined, InboxOutlined, NotificationsOutlined } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import GlobalSearchBar from "./GlobalSearchBar";
import { useNotificationsDrawer } from "../../../contexts/NotificationDrawerContext";
import { useHeader } from "../../../contexts/HeaderContext";
import { useSelector } from "react-redux";
import { resolveWorkspaceRole } from "../../../utils/workspaceRole.utils";
export default function Header() {
  const { headerTitle, headerRightActions, headerLeftContent } = useHeader();
  const { openDrawer: openNotifications } = useNotificationsDrawer();
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const workspace = useSelector((state) => state.workspace);
  const authUser = useSelector((state) => state.auth?.data);
  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const isWorkspaceAdmin = ["ADMIN", "OWNER"].includes(workspaceRole);
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

          <Tooltip title={isWorkspaceAdmin ? "Open Trego Agent" : "Workspace admins and owners only"}>
            <span>
              <IconButton
                onClick={() => {
                  if (!isWorkspaceAdmin || !workspaceSlug) return;
                  navigate(`/app/${workspaceSlug}/agent`);
                }}
                size="medium"
                disabled={!isWorkspaceAdmin}
                sx={{
                  color: isWorkspaceAdmin ? "primary.main" : "text.disabled",
                  bgcolor: (theme) => isWorkspaceAdmin ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                  border: "1px solid",
                  borderColor: (theme) => isWorkspaceAdmin ? alpha(theme.palette.primary.main, 0.18) : theme.palette.divider,
                  "&:hover": {
                    bgcolor: (theme) => isWorkspaceAdmin ? alpha(theme.palette.primary.main, 0.14) : "transparent",
                    color: isWorkspaceAdmin ? "primary.dark" : "text.disabled",
                  },
                }}
              >
                <AutoAwesomeOutlined sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>

        
          {/* Notifications */}
          <IconButton
            onClick={() => openNotifications()}
            size="medium"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <InboxOutlined sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            onClick={() => openNotifications()}
            size="medium"
            sx={{
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <NotificationsOutlined sx={{ fontSize: 20 }} />
          </IconButton>


        </Box>
      </Toolbar>
    </AppBar>
  );
}

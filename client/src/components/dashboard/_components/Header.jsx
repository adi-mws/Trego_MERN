import { AppBar, Toolbar, Box, IconButton, Tooltip, Badge, Stack, useMediaQuery, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { AutoAwesomeOutlined, ColorLens, NotificationsOutlined } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import GlobalSearchBar from "./GlobalSearchBar";
import { useNotificationsDrawer } from "../../../contexts/NotificationDrawerContext";
import { useHeader } from "../../../contexts/HeaderContext";
import { useSelector } from "react-redux";
import { resolveWorkspaceRole } from "../../../utils/workspaceRole.utils";
import { useAccountDialog } from "../../../contexts/AccountDialogContext";
export default function Header({ onMenuClick, menuIcon }) {
  const { headerTitle, headerRightActions, headerLeftContent } = useHeader();
  const { openDrawer: openNotifications } = useNotificationsDrawer();
  const { workspaceSlug } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const workspace = useSelector((state) => state.workspace);
  const authUser = useSelector((state) => state.auth?.data);
  const unreadCount = useSelector((state) => state.notifications?.unreadCount || 0);
  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const isWorkspaceAdmin = ["ADMIN", "OWNER"].includes(workspaceRole);

  const { openDialog } = useAccountDialog();
  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        bgcolor: "background.paper",
        backdropFilter: "blur(6px)",
        borderBottom: "none",
        boxShadow: "none",
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: 60, md: 64 },
          py: { xs: 1, md: 0.75 },
          px: { xs: 1.5, sm: 2, md: 3 },
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: { xs: "wrap", md: "nowrap" },
          width: "100%",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          sx={{
            minWidth: 0,
            flex: { xs: "1 1 100%", md: "0 1 auto" },
            overflow: "hidden",
          }}
        >
          {onMenuClick && (
            <IconButton
              onClick={onMenuClick}
              size="small"
              sx={{ display: { xs: "inline-flex", md: "none" }, flexShrink: 0 }}
            >
              {menuIcon}
            </IconButton>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            {headerTitle}
            {headerLeftContent && (
              <Box
                sx={{
                  display: { xs: "none", md: "flex" },
                  alignItems: "center",
                  gap: 2,
                  minWidth: 0,
                  flexWrap: "wrap",
                }}
              >
                {headerLeftContent}
              </Box>
            )}
          </Box>
        </Stack>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "flex-start", md: "flex-end" },
            gap: 1,
            flex: { xs: "1 1 100%", md: "0 0 auto" },
            width: { xs: "100%", md: "auto" },
            flexWrap: "wrap",
            ml: { md: "auto" },
          }}
        >
          <GlobalSearchBar compact />
          {headerRightActions}

          <Tooltip title={isWorkspaceAdmin ? "Open Trego Agent" : "Workspace admins and owners only"}>
            <span>
              <IconButton
                onClick={() => {
                  if (!isWorkspaceAdmin || !workspaceSlug) return;
                  navigate(`/app/${workspaceSlug}/agent`);
                }}
                size={isMobile ? "small" : "medium"}
                disabled={!isWorkspaceAdmin}
                sx={{
                  width: { xs: 36, sm: 40 },
                  height: { xs: 36, sm: 40 },
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
            onClick={() => openDialog('preferences')}
            size={isMobile ? "small" : "medium"}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <ColorLens sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            onClick={() => openNotifications()}
            size={isMobile ? "small" : "medium"}
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              overlap="circular"
              invisible={!unreadCount}
            >
              <NotificationsOutlined sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>


        </Box>
      </Toolbar>
    </AppBar>
  );
}

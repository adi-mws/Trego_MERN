import React, { useState } from "react";
import {
  Box,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  Typography,
} from "@mui/material";

import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MenuOutlined, ChevronRightOutlined, CategoryOutlined, ViewKanbanOutlined, TaskOutlined, GroupOutlined, SettingsOutlined, HistoryOutlined, ShieldOutlined, TimelineOutlined, InsightsOutlined, CommentOutlined, ChatBubbleOutlineOutlined } from "@mui/icons-material";
import { PROJECT_ROUTES } from "../../../../lib/routes";
import { AccountTreeOutlined } from "@mui/icons-material";
import { canManageProject, canManageProjectMembers, canViewProjectActivity, isClient, isClientProjectRole } from "../../../../utils/permissions.utils";
import { resolveWorkspaceRole } from "../../../../utils/workspaceRole.utils";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

function isProjectMenuItemActive(pathname, itemPath) {
  if (!itemPath) return false;
  const normalizedPathname = pathname.replace(/\/+$/, "");
  const normalizedItemPath = itemPath.replace(/\/+$/, "");
  return normalizedPathname === normalizedItemPath;
}

const ProjectSidebar = ({ forceCollapsed = false, variant = "side" }) => {
  const [collapsedState, setCollapsedState] = useState(true);
  const isBottom = variant === "bottom";
  const collapsed = forceCollapsed ? true : collapsedState;

  const navigate = useNavigate();
  const location = useLocation();
  const { projectSlug } = useParams();

  const workspaceSlug = useSelector((state) => state.workspace?.slug);
  const project = useSelector((state) => state.project); // optional if you store project
  const projectCanViewActivity = canViewProjectActivity(project);
  const projectCanManageProject = canManageProject(project);
  const projectCanManageMembers = canManageProjectMembers(project);
  const authUser = useSelector((state) => state.auth?.data);
  const workspace = useSelector((state) => state.workspace);
  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const clientProjectViewer = isClient(workspaceRole) || isClientProjectRole(project);

  const menuItems = clientProjectViewer
    ? [
      {
        label: "AI Chat",
        icon: <ChatBubbleOutlineOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectClientChat(workspaceSlug, projectSlug),
        visible: projectCanViewActivity,
      },
    ]
    : [
      {
        label: "Overview",
        icon: <InsightsOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.overview(workspaceSlug, projectSlug),
        visible: projectCanViewActivity,
      },
      {
        label: "Board",
        icon: <ViewKanbanOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectTaskBoard(workspaceSlug, projectSlug),
        visible: projectCanViewActivity,
      },
      {
        label: "Tasks",
        icon: <TaskOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectTasks(workspaceSlug, projectSlug),
        visible: projectCanViewActivity,
      },
      {
        label: "Timeline",
        icon: <TimelineOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectTimeline(workspaceSlug, projectSlug),
        visible: projectCanViewActivity,
      },
      {
        label: "Task Categories",
        icon: <CategoryOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectTaskCategories(workspaceSlug, projectSlug),
        visible: projectCanViewActivity && projectCanManageProject,
      },
      {
        label: "Task State History",
        icon: <HistoryOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectTaskStateHistory(workspaceSlug, projectSlug),
        visible: projectCanViewActivity,
      },
      {
        label: "Comments",
        icon: <CommentOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectComments(workspaceSlug, projectSlug),
        visible: projectCanViewActivity,
      },

      {
        label: "Workflows",
        icon: <AccountTreeOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectWorkflows(workspaceSlug, projectSlug),
        visible: projectCanManageProject,
      },

      {
        label: "Members",
        icon: <GroupOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectMembers(workspaceSlug, projectSlug),
        visible: projectCanManageMembers,
      },
      {
        label: "Roles",
        icon: <ShieldOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectRoles(workspaceSlug, projectSlug),
        visible: projectCanManageProject,
      },
      {
        label: "Settings",
        icon: <SettingsOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.projectSettings(workspaceSlug, projectSlug),
        visible: projectCanManageProject,
      },
    ].filter((item) => item.visible !== false);

  if (isBottom) {
    return (
      <Box
        component="nav"
        sx={{
          flexShrink: 0,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflowX: "auto",
          overflowY: "hidden",
          width: "100%",
          m: 0,
          px: 0,
          py: 0.25,

          scrollbarWidth: "thin",
        }}
      >
        <List

          sx={{
            display: "flex",
            justifySelf: 'center',
            gap: 2,
            width: "800px",
            px: 0.25, 
          }}
        >
          {menuItems.map((item) => {
            const isActive = isProjectMenuItemActive(location.pathname, item.path);

            return (
              <Tooltip key={item.label} title={item.label} placement="top">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    width: 36,
                    height: 36,
                    minWidth: 36,
                    borderRadius: 1.25,
                    p: 0,
                    justifyContent: "center",
                    bgcolor: isActive ? "action.selected" : "transparent",
                    color: isActive ? "primary.main" : "text.secondary",
                    "&:hover": {
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  {item.icon}
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH,
        transition: "width 0.25s ease",
        borderLeft: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        bgcolor: "background.paper",
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: 1.5,
          py: 1,
        }}
      >
        {!collapsed && (
          <Typography fontSize={14} fontWeight={600}>
            {project?.name || "Project"}
          </Typography>
        )}

        {!forceCollapsed && (
          <IconButton
            size="small"
            onClick={() => setCollapsedState((value) => !value)}
            sx={{
              transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            {collapsed ? <ChevronRightOutlined /> : <MenuOutlined />}
          </IconButton>
        )}
      </Box>

      <Divider />

      <List sx={{ mt: 1, px: 0.5, flex: 1, minHeight: 0 }}>
        {menuItems.map((item, index) => {
          const isActive = isProjectMenuItemActive(location.pathname, item.path);

          return (
            <Tooltip
              key={index}
              title={collapsed ? item.label : ""}
              placement="left"
            >
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  borderRadius: collapsed ? 3 : 2,
                  mb: collapsed ? 1.5 : 0.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  width: collapsed ? 44 : "auto",
                  height: collapsed ? 44 : "auto",
                  mx: collapsed ? "auto" : 0,
                  p: collapsed ? 0 : 1.25,

                  bgcolor: isActive ? "action.selected" : "transparent",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: 6,
                    bottom: 6,
                    width: 3,
                    borderRadius: 2,
                    bgcolor: isActive ? "primary.main" : "transparent",
                    display: collapsed ? "none" : "block",
                  }}
                />


                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 1.5,
                    justifyContent: "center",
                    color: isActive ? "primary.main" : "text.secondary",
                  }}
                >
                  {item.icon}
                </ListItemIcon>

                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
};

export default ProjectSidebar;

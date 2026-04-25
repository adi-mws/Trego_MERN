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
import { MenuOutlined, ChevronRightOutlined, CategoryOutlined, ViewKanbanOutlined, TaskOutlined, GroupOutlined, SettingsOutlined, HistoryOutlined, ShieldOutlined, TimelineOutlined, InsightsOutlined, CommentOutlined } from "@mui/icons-material";
import { PROJECT_ROUTES } from "../../../../lib/routes";
import { AccountTreeOutlined } from "@mui/icons-material";
import { canManageProject, canManageProjectMembers, canViewProjectActivity, isClient, isClientProjectRole } from "../../../../utils/permissions.utils";
import { resolveWorkspaceRole } from "../../../../utils/workspaceRole.utils";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const ProjectSidebar = ({ onOpenMembers }) => {
  const [collapsed, setCollapsed] = useState(true);

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
        label: "Overview",
        icon: <InsightsOutlined sx={{ fontSize: 20 }} />,
        path: PROJECT_ROUTES.overview(workspaceSlug, projectSlug),
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
        icon: <HistoryOutlined sx={{fontSize: 20}} />, 
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

        <IconButton
          size="small"
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            transform: collapsed ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        >
          {collapsed ? <ChevronRightOutlined /> : <MenuOutlined />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ mt: 1, px: 0.5, flex: 1, minHeight: 0 }}>
        {menuItems.map((item, index) => {
          const isOverview =
            index === 0 &&
            location.pathname === PROJECT_ROUTES.overview(workspaceSlug, projectSlug)

          const isActive =
            isOverview ||
            (index !== 0 &&
              (
                location.pathname === item.path ||
                location.pathname.startsWith(item.path + '/')
              ))

          return (
            <Tooltip
              key={index}
              title={collapsed ? item.label : ""}
              placement="left"
            >
              <ListItemButton
                onClick={() => {
                  if (item.action === "openMembers") {
                    onOpenMembers?.();
                  } else {
                    navigate(item.path);
                  }
                }}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1 : 1.5,

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

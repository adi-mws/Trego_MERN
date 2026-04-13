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
  Card,
} from "@mui/material";

import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import TaskIcon from "@mui/icons-material/Task";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import { PROJECT_ROUTES } from "../../../../lib/routes";
import { Analytics, ChatRounded } from "@mui/icons-material";

const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const ProjectSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { projectSlug } = useParams();

  const workspaceSlug = useSelector((state) => state.workspace?.slug);
  const project = useSelector((state) => state.project); // optional if you store project

  const menuItems = [
    {
      label: "Overview",
      icon: <Analytics sx={{ fontSize: 20 }} />,
      path: PROJECT_ROUTES.overview(workspaceSlug, projectSlug),
    },
    {
      label: "Board",
      icon: <ViewKanbanIcon sx={{ fontSize: 20 }} />,
      path: PROJECT_ROUTES.projectTaskBoard(workspaceSlug, projectSlug),
    },
    {
      label: "Tasks",
      icon: <TaskIcon sx={{ fontSize: 20 }} />,
      path: PROJECT_ROUTES.projectTasks(workspaceSlug, projectSlug),
    },

    {
      label: "Members",
      icon: <GroupIcon sx={{ fontSize: 20 }} />,
      path: PROJECT_ROUTES.projectMembers(workspaceSlug, projectSlug),
    },
    {
      label: "Settings",
      icon: <SettingsIcon sx={{ fontSize: 20 }} />,
      path: PROJECT_ROUTES.projectSettings(workspaceSlug, projectSlug),
    },
    {
      label: "Members",
      icon: <GroupIcon />,
      action: "openMembers",
    }
  ];

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
        bgcolor: "background.paper",
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
          {collapsed ? <ChevronRightIcon /> : <MenuIcon />}
        </IconButton>
      </Box>

      <Divider />

      <List sx={{ mt: 2, px: 0.5 }}>
        {menuItems.map((item, index) => {
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");

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
                  mb: 2,
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
import React from 'react'
import {
  Box,
  Typography,
  Avatar,
  Stack,
  Button,
  IconButton,
} from '@mui/material'

import {
  Group as MembersIcon,
  Settings as SettingsIcon,
  Security as RolesIcon,
  Add as AddIcon,
  ViewKanban as BoardIcon,
  Checklist as TasksIcon,
  AccountTree as WorkflowIcon,
  Timeline as GanttIcon,
} from '@mui/icons-material'

import { useNavigate, useLocation } from 'react-router-dom'

export default function ProjectHeader({ project }) {
  const navigate = useNavigate()
  const location = useLocation()

  const base = `/projects/${project?._id}`

  const navItems = [
    { label: 'Tasks', icon: <TasksIcon />, path: `${base}/tasks` },
    { label: 'Board', icon: <BoardIcon />, path: `${base}/board` },
    { label: 'Workflow', icon: <WorkflowIcon />, path: `${base}/workflow` },
    { label: 'Gantt', icon: <GanttIcon />, path: `${base}/gantt` },
    { label: 'Members', icon: <MembersIcon />, path: `${base}/members` },
    { label: 'Roles', icon: <RolesIcon />, path: `${base}/roles` },
    { label: 'Settings', icon: <SettingsIcon />, path: `${base}/settings` },
  ]

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Top Row */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">

        {/* Left: Project Info */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32 }}>
            {project?.name?.[0] || 'P'}
          </Avatar>

          <Box>
            <Typography fontWeight={600} fontSize={15}>
              {project?.name || 'Project Name'}
            </Typography>

            <Typography fontSize={11} color="text.secondary">
              Project workspace
            </Typography>
          </Box>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            mt: 1,
            overflowX: 'auto',
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname.includes(item.path)

            return (
              <Stack
                key={item.label}
                direction="row"
                alignItems="center"
                spacing={0.5}
                onClick={() => navigate(item.path)}
                sx={{
                  px: 1.2,
                  py: 0.6,
                  borderRadius: 1,
                  cursor: 'pointer',
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box
                  sx={{
                    '& .MuiSvgIcon-root': {
                      fontSize: 16,
                    },
                    display: 'flex',
                    alignItems: 'center',
                  }}

                >
                  {item.icon}
                </Box>

                <Typography fontSize={12} fontWeight={500}>
                  {item.label}
                </Typography>
              </Stack>
            )
          })}
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ textTransform: 'none' }}
          >
            Invite
          </Button>
        </Stack>
      </Stack>

      {/* Navigation Row */}

    </Box>
  )
}
import React, { useState } from 'react'
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Stack,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'

import {
  MoreVert as MoreIcon,
  Group as MembersIcon,
  Settings as SettingsIcon,
  Security as RolesIcon,
  Add as AddIcon,
} from '@mui/icons-material'

import { useNavigate, useLocation } from 'react-router-dom'

export default function ProjectHeader({ project }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [anchorEl, setAnchorEl] = useState(null)

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget)
  const handleMenuClose = () => setAnchorEl(null)

  // Detect active tab
  const getTabValue = () => {
    if (location.pathname.includes('board')) return 1
    if (location.pathname.includes('tasks')) return 2
    if (location.pathname.includes('members')) return 3
    if (location.pathname.includes('roles')) return 4
    if (location.pathname.includes('settings')) return 5
    return 0
  }

  const handleTabChange = (_, value) => {
    const base = `/projects/${project?._id}`

    const routes = [
      `${base}/overview`,
      `${base}/board`,
      `${base}/tasks`,
      `${base}/members`,
      `${base}/roles`,
      `${base}/settings`,
    ]

    navigate(routes[value])
  }

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

        {/* Left */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ width: 32, height: 32 }}>
            {project?.name?.[0] || 'P'}
          </Avatar>

          <Box>
            <Typography fontWeight={600} fontSize={16}>
              {project?.name || 'Project Name'}
            </Typography>

            <Typography fontSize={12} color="text.secondary">
              Project workspace
            </Typography>
          </Box>
        </Stack>

        {/* Right Actions */}
        <Stack direction="row" spacing={1} alignItems="center">

          {/* Invite */}
          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => console.log('Open invite dialog')}
          >
            Invite
          </Button>

          {/* Quick Actions */}
          <IconButton size="small" onClick={() => navigate('members')}>
            <MembersIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" onClick={() => navigate('roles')}>
            <RolesIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" onClick={() => navigate('settings')}>
            <SettingsIcon fontSize="small" />
          </IconButton>

          {/* More Menu */}
          <IconButton size="small" onClick={handleMenuOpen}>
            <MoreIcon fontSize="small" />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => navigate('members')}>Members</MenuItem>
            <MenuItem onClick={() => navigate('roles')}>Roles</MenuItem>
            <MenuItem onClick={() => navigate('settings')}>Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      {/* Tabs */}
      <Tabs
        value={getTabValue()}
        onChange={handleTabChange}
        sx={{
          mt: 1,
          minHeight: 36,
          '& .MuiTab-root': {
            minHeight: 36,
            textTransform: 'none',
            fontSize: 13,
          },
        }}
      >
        <Tab label="Overview" />
        <Tab label="Board" />
        <Tab label="Tasks" />
        <Tab label="Members" />
        <Tab label="Roles" />
        <Tab label="Settings" />
      </Tabs>
    </Box>
  )
}
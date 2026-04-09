import React, { useEffect } from 'react'
import WorkspaceSidebarNav from '../components/dashboard/_components/WorkspaceSidebarNav'
import MembersSidebar from '../components/dashboard/_components/MembersSidebar'
import Header from '../components/dashboard/_components/Header'

import { Box, Stack, Avatar, Chip } from '@mui/material'
import { Outlet, useParams } from 'react-router-dom'

import { useHeader } from '../contexts/HeaderContext'

// 🔧 You should replace this with real data from API/store
const mockWorkspace = {
  members: [
    { id: 1, name: 'Aditya', avatar: '' },
    { id: 2, name: 'Rahul', avatar: '' },
    { id: 3, name: 'Priya', avatar: '' },
    { id: 4, name: 'Amit', avatar: '' },
  ],
  totalMembers: 12,
}

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#ebbc00', '#6C5CE7']

function formatMemberCount(count) {
  return `${count} members`
}

export default function WorkspacesLayout() {
  const { setHeaderLeftContent, setHeaderTitle } = useHeader()
  const { workspaceSlug } = useParams()

  const ws = mockWorkspace 

  useEffect(() => {
    setHeaderTitle(workspaceSlug || 'Workspace')
    setHeaderLeftContent(
      <>
        <Chip label="Owner" sx={{fontSize: 12}} size='small' color='success' />

        <Stack direction="row" spacing={-0.75} alignItems="center">

          {(ws.members ?? []).slice(0, 4).map((member, index) => (
            <Avatar
              key={member.id}
              sx={{
                width: 24,
                height: 24,
                fontSize: 11,
                fontWeight: 600,
                border: '2px solid',
                borderColor: 'background.paper',
                bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length],
              }}
            >
              {member.name?.[0]?.toUpperCase()}
            </Avatar>
          ))}

          <Box
            sx={{
              ml: 1,
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: 11,
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}
          >
            {formatMemberCount(ws.totalMembers)}
          </Box>

        </Stack>
      </>
    )
  }, [workspaceSlug])

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        height: '100vh',
      }}
    >
      {/* LEFT SIDEBAR */}
      <Box
        sx={{
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <WorkspaceSidebarNav />
      </Box>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Header />

        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
          }}
        >
          <Outlet />
        </Box>


        <MembersSidebar />
      </Box>
    </Box>
  )
}
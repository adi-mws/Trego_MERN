import React, { useEffect, useState } from 'react'
import WorkspaceSidebarNav from '../components/dashboard/_components/WorkspaceSidebarNav'
import MembersSidebar from '../components/dashboard/_components/MembersSidebar'
import Header from '../components/dashboard/_components/Header'

import { Box, Stack, Avatar, Chip } from '@mui/material'
import { Outlet, useParams } from 'react-router-dom'

import { useHeader } from '../contexts/HeaderContext'
import { callApi } from '../api/api'
import { getImageUrl } from '../utils/image.utils'
import { setWorkspace, setLoading, clearWorkspace } from '../redux/slices/currentWorkspaceSlice'
import { useDispatch, useSelector } from 'react-redux';


const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#ebbc00', '#6C5CE7']

function formatMemberCount(count) {
  return `${count} members`
}

export default function WorkspaceDetailLayout() {
  const { setHeaderLeftContent, setHeaderTitle } = useHeader()
  const { workspaceSlug } = useParams()
  const dispatch = useDispatch();
  const workspace = useSelector((state) => state?.workspace);

  const fetchWorkspace = async () => {
    dispatch(setLoading(true));
    const res = await callApi({
      url: `/workspaces/global/${workspaceSlug}`,
    })

    if (res.success) {
      console.log(res.data.workspace)
      dispatch(setWorkspace(res.data.workspace))
      dispatch(setLoading(false))

    } else {
      console.error("Failed to fetch workspace:", res.error)
    }
    dispatch(setLoading(false))
  }

  useEffect(() => {
    if (workspaceSlug) {
      fetchWorkspace()
    }

    return () => dispatch(clearWorkspace());
  }, [workspaceSlug])

  useEffect(() => {
    if (!workspace) return

    setHeaderTitle(workspace.name || workspaceSlug || 'Workspace')

    setHeaderLeftContent(
      <>
        <Chip label={workspace.role} sx={{ fontSize: 12 }} size="small" color="success" />

        <Stack direction="row" spacing={-0.75} alignItems="center">
          {(workspace.members ?? []).slice(0, 4).map((member, index) => (
            <Avatar
              key={member._id || index}
              src={getImageUrl(member.avatar)}
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
              {!member.avatar && member.name?.[0]?.toUpperCase()}
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
            {formatMemberCount(workspace.totalMembers || 0)}
          </Box>
        </Stack>
      </>
    )
  }, [workspace, workspaceSlug])

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

      {/* MAIN */}
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
          <Outlet context={{ workspace }} />
        </Box>

        <MembersSidebar workspace={workspace} loading={workspace.isLoading} />
      </Box>
    </Box>
  )
}
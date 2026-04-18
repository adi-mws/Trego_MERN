import React, { useEffect } from 'react'
import WorkspaceSidebarNav from '../components/dashboard/_components/WorkspaceSidebarNav'
import Header from '../components/dashboard/_components/Header'
import RightSidebar from '../components/dashboard/_components/RightSidebar'
import { Box, Stack, Avatar, Chip } from '@mui/material'
import { Outlet, useParams } from 'react-router-dom'

import { useHeader } from '../contexts/HeaderContext'
import { callApi } from '../api/api'
import { getImageUrl } from '../utils/image.utils'
import {
  setWorkspace,
  setLoading,
  clearWorkspace,
} from '../redux/slices/workspaceSlice'
import { useDispatch, useSelector } from 'react-redux'
import { clearProject, setProject } from '../redux/slices/projectSlice'

const AVATAR_COLORS = ['#FF6B6B', '#4ECDC4', '#ebbc00', '#6C5CE7']

function formatMemberCount(count) {
  return `${count} members`
}

export default function WorkspaceDetailLayout() {
  const { setHeaderLeftContent, setHeaderTitle } = useHeader()
  const { workspaceSlug, projectSlug } = useParams()

  const dispatch = useDispatch()
  const workspace = useSelector((state) => state?.workspace)

  const fetchWorkspace = async () => {
    try {
      dispatch(setLoading(true))

      const res = await callApi({
        url: `/workspaces/global/${workspaceSlug}`,
      })

      if (res.success) {
        dispatch(setWorkspace(res.data.workspace))
        console.log(res.data.workspace)
      }
    } catch (err) {
      console.error(err)
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    if (workspaceSlug) fetchWorkspace()
    return () => dispatch(clearWorkspace())
  }, [workspaceSlug])


  const fetchProject = async () => {
    try {
      dispatch(setLoading(true));

      const res = await callApi({
        url: `/projects/global/${projectSlug}`,
      });

      if (res.success) {
        console.log(res.data)
        dispatch(setProject(res.data));

        console.log(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

useEffect(() => {
  if (!projectSlug) return;

  fetchProject();

  return () => dispatch(clearProject());
}, [projectSlug]);

  useEffect(() => {
    if (!workspace) return
    if (location.pathname.includes('projects') && !projectSlug) return 

    setHeaderTitle(workspace.name || workspaceSlug || 'Workspace')

    setHeaderLeftContent(
      <>
        <Chip label={workspace.role} size="small" color="success" sx={{ fontSize: 12 }} />

        <Stack direction="row" spacing={-0.75} alignItems="center">
          {(workspace.members || []).slice(0, 4).map((member, index) => (
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

  const isProjectView = Boolean(projectSlug)

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: isProjectView
          ? '240px 1fr auto'
          : '240px 1fr auto',
        gridTemplateRows: 'auto 1fr',
        height: '100vh',
      }}
    >
      {/* LEFT SIDEBAR */}
      <Box
        sx={{
          gridRow: '1 / span 2',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <WorkspaceSidebarNav />
      </Box>

      {/* HEADER (ONLY CENTER) */}
      <Box
        sx={{
          gridColumn: '2',
          gridRow: '1',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Header />
      </Box>

      {/* MAIN CONTENT */}
      <Box
        sx={{
          gridColumn: '2',
          gridRow: '2',
          overflow: 'auto',
          p: 2,
        }}
      >
        <Outlet context={{ workspace }} />
      </Box>

      {/* RIGHT SIDEBAR */}

      <Box
        sx={{
          gridColumn: "3",
          gridRow: "1 / span 2",
          borderLeft: "1px solid",
          borderColor: "divider",
        }}
      >
        <RightSidebar />
      </Box>
    </Box>
  )
}
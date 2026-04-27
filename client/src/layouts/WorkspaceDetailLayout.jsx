import { useCallback, useEffect, useState } from 'react'
import WorkspaceSidebarNav from '../components/dashboard/_components/WorkspaceSidebarNav'
import Header from '../components/dashboard/_components/Header'
import RightSidebar from '../components/dashboard/_components/RightSidebar'
import { Box, Drawer, Stack, Avatar, Chip, useMediaQuery, useTheme } from '@mui/material'
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined'
import { Outlet, useLocation, useParams } from 'react-router-dom'

import { useHeader } from '../contexts/HeaderContext'
import { callApi } from '../api/api'
import { getImageUrl } from '../utils/image.utils'
import { resolveWorkspaceRole } from '../utils/workspaceRole.utils'
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
  const location = useLocation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  const dispatch = useDispatch()
  const workspace = useSelector((state) => state?.workspace)
  const authUser = useSelector((state) => state.auth?.data)

  const fetchWorkspace = useCallback(async () => {
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
  }, [dispatch, workspaceSlug])

  useEffect(() => {
    if (workspaceSlug) fetchWorkspace()
    return () => dispatch(clearWorkspace())
  }, [dispatch, fetchWorkspace, workspaceSlug])


  const fetchProject = useCallback(async () => {
    dispatch(setLoading(true));

    const res = await callApi({
      url: `/projects/global/${projectSlug}`,
      params: { workspaceSlug },
    });

    if (res.success) {
      console.log(res.data);
      dispatch(setProject(res.data));

    } else {
      console.error(res.error);
    }
    dispatch(setLoading(false));

  }, [dispatch, projectSlug, workspaceSlug]);

  useEffect(() => {
    if (!projectSlug) return

    fetchProject();

    return () => dispatch(clearProject());
  }, [dispatch, fetchProject, projectSlug]);

  useEffect(() => {
    if (!workspace?.slug && !workspace?.name && !workspace?.currentWorkspace) return
    if (location.pathname.includes('projects') && !projectSlug) return
    const workspaceRole = resolveWorkspaceRole(workspace, authUser) || 'MEMBER'
    setHeaderTitle(workspace.name || workspaceSlug || 'Workspace')

    setHeaderLeftContent(
      <>
        <Chip
          label={workspaceRole}
          size="small"
          color={["ADMIN", "OWNER"].includes(workspaceRole) ? "success" : "default"}
          sx={{ fontSize: 12 }}
        />

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
  }, [authUser, location.pathname, projectSlug, setHeaderLeftContent, setHeaderTitle, workspace, workspaceSlug])

  return (
    <Box
      sx={{
        height: '100dvh',
        maxHeight: '100dvh',
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: 'background.default',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Drawer
        open={!isDesktop && mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        PaperProps={{
          sx: {
            width: 290,
            maxWidth: '100vw',
          },
        }}
      >
        <WorkspaceSidebarNav onNavigate={() => setMobileSidebarOpen(false)} />
      </Drawer>

      {/* LEFT SIDEBAR */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 260,
          flexShrink: 0,
          borderRight: '1px solid',
          borderColor: 'divider',
          minWidth: 0,
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <WorkspaceSidebarNav />
      </Box>

      {/* HEADER (ONLY CENTER) */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <Header
          onMenuClick={() => setMobileSidebarOpen(true)}
          menuIcon={<MenuOutlinedIcon />}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
            overflow: "hidden",
            p: { xs: 1.5, sm: 2 },
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Box sx={{ flex: 1, minHeight: 0, overflow: "auto" }}>
            <Outlet context={{ workspace }} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexShrink: 0,
          alignSelf: 'stretch',
          borderLeft: '1px solid',
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          height: '100dvh',
          maxHeight: '100dvh',
          overflow: 'hidden',
        }}
      >
        <RightSidebar key={projectSlug || workspaceSlug} />
      </Box>
    </Box>
  )
}

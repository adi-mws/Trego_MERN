import { useEffect } from "react"
import { Alert, Box, Button, Stack, Typography } from '@mui/material'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { canViewProjectActivity, isClient, isClientProjectRole } from '../utils/permissions.utils'
import { PROJECT_ROUTES, WORKSPACE_ROUTES } from '../lib/routes'
import { resolveWorkspaceRole } from '../utils/workspaceRole.utils'

export default function ProjectLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { workspaceSlug, projectSlug } = useParams()
  const project = useSelector((state) => state.project)
  const workspace = useSelector((state) => state.workspace)
  const authUser = useSelector((state) => state.auth?.data)
  const workspaceRole = resolveWorkspaceRole(workspace, authUser)
  const canViewActivity = canViewProjectActivity(project)
  const clientProjectViewer = isClient(workspaceRole) || isClientProjectRole(project)
  const chatPath = PROJECT_ROUTES.projectClientChat(workspaceSlug, projectSlug || project.slug || "")

  useEffect(() => {
    if (!project._id || !clientProjectViewer) {
      return
    }

    if (location.pathname !== chatPath) {
      navigate(chatPath, { replace: true })
    }
  }, [chatPath, clientProjectViewer, location.pathname, navigate, project._id])

  if (project._id && !canViewActivity) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Alert
          severity="warning"
          sx={{ width: "min(720px, 100%)", borderRadius: 3 }}
        >
          <Stack spacing={1.5}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                You do not have permission to view this project
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Ask a project admin to grant you activity access before you can view tasks, comments, timelines, or project details.
              </Typography>
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={() => navigate(WORKSPACE_ROUTES.workspace(workspaceSlug))}
              >
                Go to Workspace
              </Button>
            </Box>
          </Stack>
        </Alert>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: "100%",          
        display: "flex",         
        flexDirection: "column",
        minHeight: 0,            
      }}
    >
      <Outlet />
    </Box>
  )
}

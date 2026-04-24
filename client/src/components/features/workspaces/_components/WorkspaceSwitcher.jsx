import { useState } from 'react'
import {
  Box,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  Button,
  Stack,
  Paper,
  TextField,
} from '@mui/material'



import {
  SwapHoriz as SwitchIcon,
  Add as AddIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  WorkspacesOutline,
} from '@mui/icons-material'

import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { callApi } from '../../../../api/api'
import { WORKSPACE_ROUTES } from '../../../../lib/routes'
import CreateWorkspaceDialog from './CreateWorkspaceDialog'
import Loading from '../../../global/Loading'

export default function WorkspaceSwitcher() {

  const [anchorEl, setAnchorEl] = useState(null)
  const [workspaces, setWorkspaces] = useState([])
  const [workspaceSearch, setWorkspaceSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [openCreateWorkspaceDialog, setOpenCreateWorkspaceDialog] = useState(false);
  const navigate = useNavigate()
  const { currentWorkspace, isLoading: isWorkspaceChanging } = useSelector((state) => state?.workspace)
  const fetchWorkspaces = async () => {
    setLoading(true);
    const res = await callApi({
      method: "GET",
      url: "/workspaces",
      params: {
        search: workspaceSearch || undefined,


      }
    })

    if (res?.success) {
      setWorkspaces(res?.data?.workspaces || [])
    } else {
      console.error(res?.error)
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchWorkspaces()
  }, [workspaceSearch]);



  const location = useLocation()

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setWorkspaceSearch("")

  }

  const handleWorkspaceSelect = async (workspace) => {
    navigate(WORKSPACE_ROUTES.workspace(workspace?.slug));
    setWorkspaceSearch("");
    setAnchorEl(null)
  }

  // Extract slug from URL (React Router version)
  const segments = location.pathname.split('/')
  const currentSlug = segments.length > 2 ? segments[2] : null
  const workspace = useSelector((state) => state?.workspace);
  const currentName =
    workspaces.find((w) => w.slug === currentSlug)?.name ||
    workspace?.name ||
    "Switch Workspace"

  const open = Boolean(anchorEl)


  const handleWorkspaceCreation = () => {

  }
  // removed early return to prevent unmounting and losing focus

  return (
    <>
      {/* Workspace Button */}
      <Paper
        elevation={0}
        onClick={handleClick}
        sx={{
          px: 2,
          py: 1.5,
          backgroundColor: 'primary.main',
          borderRadius: 1,
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 600,
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {currentName}
            </Typography>
            <Box sx={{ display: "flex", mt: .5, gap: .5 }}>
              <WorkspacesOutline sx={{ fontSize: 14, color: 'white' }} />
              <Typography
                variant="caption"
                sx={{ color: 'white' }}
              >
                Current Workspace
              </Typography>
            </Box>
          </Box>

          <SwitchIcon sx={{ color: 'white', fontSize: '1.2rem' }} />
        </Stack>
      </Paper>

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header */}
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
              Switch Workspace
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={workspaceSearch}
              onChange={(e) => setWorkspaceSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, fontSize: '1rem', color: 'text.secondary' }} />
                ),
              }}
            />
          </Box>

          {/* Workspace List */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={3}><Loading /></Box>
            ) : workspaces.length > 0 ? (
              <List disablePadding>
                {workspaces.map((workspace) => {
                  const isActive = workspace.slug === currentSlug

                  return (
                    <ListItemButton
                      key={workspace._id || workspace.id}
                      onClick={() => handleWorkspaceSelect(workspace)}
                      selected={isActive}
                      sx={{
                        mb: 0.5,
                        borderRadius: 1,
                        backgroundColor: isActive ? 'primary.lighter' : 'transparent',
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 30 }}>
                        {isActive && (
                          <CheckIcon sx={{ color: 'primary.main', fontSize: '1rem' }} />
                        )}
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isActive ? 600 : 500,
                              color: isActive ? 'primary.main' : 'text.primary',
                            }}
                          >
                            {workspace.name}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  )
                })}
              </List>
            ) : (
              <Typography
                variant="body2"
                sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}
              >
                No workspaces found
              </Typography>
            )}
          </Box>

          {/* Footer */}
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
            <Button
              startIcon={<AddIcon />}
              fullWidth
              size="small"
              onClick={() => setOpenCreateWorkspaceDialog(true)}
              sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
            >
              New Workspace
            </Button>
          </Box>
        </Box>
        <CreateWorkspaceDialog onClose={() => setOpenCreateWorkspaceDialog(false)} open={openCreateWorkspaceDialog} onWorkspaceCreation={handleWorkspaceCreation} />
      </Popover>
    </>
  )
}
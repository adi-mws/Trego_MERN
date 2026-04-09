import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
} from '@mui/material'


const PROJECT_ROLE_CONFIG = {
  manager: {
    label: 'Manager',
    description: 'Manage scope, members, and workflows',
  },
  developer: {
    label: 'Developer',
    description: 'Build and modify project features',
  },
  designer: {
    label: 'Designer',
    description: 'Design UI/UX and visuals',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access',
  },
}


export function ProjectInviteDialog({
  open,
  onClose,
  workspaceMembers,
}) {
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedRoles, setSelectedRoles] = useState(['viewer'])

  const toggleRole = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    )
  }

  const handleClose = () => {
    setSelectedMember('')
    setSelectedRoles(['viewer'])
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      {/* Title */}
      <DialogTitle>Add member to project</DialogTitle>

      {/* Content */}
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography variant="body2" color="text.secondary">
            Choose a workspace member and assign one or more project roles.
          </Typography>

          {/* Member selector */}
          <TextField
            select
            size="small"
            label="Workspace member"
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            SelectProps={{ native: true }}
            slotProps={{
              inputLabel: { shrink: true },
              input: {
                sx: {
                  fontSize: '0.875rem',
                  '&::placeholder': {
                    fontSize: '0.75rem',
                    opacity: 0.7,
                  },
                }
            }}}
            fullWidth
          >
            <option value="" disabled>
              Select a member
            </option>
            {workspaceMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </TextField>

          {/* Role selector */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                mb: 0.75,
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              Project roles
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.75,
              }}
            >
              {(
                Object.keys(PROJECT_ROLE_CONFIG)).map((role) => {
                const selected = selectedRoles.includes(role)

                return (
                  <Chip
                    key={role}
                    label={PROJECT_ROLE_CONFIG[role].label}
                    clickable
                    size="small"
                    color={selected ? 'primary' : 'default'}
                    variant={selected ? 'filled' : 'outlined'}
                    onClick={() => toggleRole(role)}
                    sx={{
                      fontSize: '0.7rem',
                    }}
                  />
                )
              })}
            </Box>

            <Typography
              variant="caption"
              sx={{ mt: 0.75, color: 'text.secondary' }}
            >
              Selected roles determine what the member can access inside this
              project.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!selectedMember || selectedRoles.length === 0}
        >
          Add to Project
        </Button>
      </DialogActions>
    </Dialog>
  )
}

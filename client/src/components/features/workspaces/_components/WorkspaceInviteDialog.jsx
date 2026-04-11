import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  Box,
  Chip,
  IconButton,
  Typography,
  MenuItem,
} from '@mui/material'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import { callApi } from '../../../../api/api'
import { useSelector } from 'react-redux'
import { useAlert } from '../../../../hooks/useAlert'

const WORKSPACE_ROLE_CONFIG = {
  member: { label: 'Member' },
  admin: { label: 'Admin' },
  client: { label: 'Client' },
}

const EXPIRY_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '24 hours', hours: 24 },
  { label: '48 hours', hours: 48 },
  { label: '7 days', hours: 168 },
]

const MEMBER_LIMIT_OPTIONS = [
  { label: '1 member', value: 1 },
  { label: '5 members', value: 5 },
  { label: '10 members', value: 10 },
  { label: '25 members', value: 25 },
  { label: 'Unlimited', value: -1 },
  { label: 'Custom', value: 0 },
]

export function WorkspaceInviteDialog({ open, onClose }) {
  const [role, setRole] = useState('member')
  const [expiryHours, setExpiryHours] = useState(24)

  const [maxUses, setMaxUses] = useState(1)
  const [customMaxUses, setCustomMaxUses] = useState('')

  const [invite, setInvite] = useState(null)
  const [loading, setLoading] = useState(false)
  const workspaceId = useSelector((state) => state?.workspace?._id);


  const resolvedMaxUses =
    maxUses === 0 ? Number(customMaxUses) : maxUses

  const canGenerate =
    maxUses !== 0 || (customMaxUses !== '' && Number(customMaxUses) > 0)

  // BACKEND CALL
  const generateInviteLink = async () => {
    if (!canGenerate) return
    setLoading(true)

    const res = await callApi({
      method: "post",
      url: "/workspaces/invite",
      data: {
        workspaceId: workspaceId,
        role,
        expiryHours,
        maxUses: resolvedMaxUses,
      },
    })

    if (res.success) {
      setInvite({
        link: res.data.link,
      })
    } else {
      console.error("Invite generation failed:", res.error);
    }
    setLoading(false)
  }
  const showAlert = useAlert();

  const copyValue = async () => {
    if (invite?.link) {
      await navigator.clipboard.writeText(invite.link)
    }
    
    showAlert("Invite link copied to clipboard", "success")
  }

  const handleClose = () => {
    setRole('member')
    setExpiryHours(24)
    setMaxUses(1)
    setCustomMaxUses('')
    setInvite(null)
    onClose && onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Invite to Workspace</DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>

          {/* Roles */}
          <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
            {Object.keys(WORKSPACE_ROLE_CONFIG).map((r) => (
              <Chip
                key={r}
                label={WORKSPACE_ROLE_CONFIG[r].label}
                clickable
                size="small"
                color={role === r ? 'primary' : 'default'}
                variant={role === r ? 'filled' : 'outlined'}
                onClick={() => setRole(r)}
                sx={{ fontSize: '0.7rem' }}
              />
            ))}
          </Box>

          {/* Expiry */}
          <TextField
            select
            size="small"
            label="Invite expires in"
            value={expiryHours}
            onChange={(e) => setExpiryHours(Number(e.target.value))}
            fullWidth
          >
            {EXPIRY_OPTIONS.map((o) => (
              <MenuItem key={o.hours} value={o.hours}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          {/* Limit */}
          <TextField
            select
            size="small"
            label="Invite usage limit"
            value={maxUses}
            onChange={(e) => {
              const v = Number(e.target.value)
              setMaxUses(v)
              if (v !== 0) setCustomMaxUses('')
            }}
            fullWidth
          >
            {MEMBER_LIMIT_OPTIONS.map((o) => (
              <MenuItem key={o.label} value={o.value}>
                {o.label}
              </MenuItem>
            ))}
          </TextField>

          {maxUses === 0 && (
            <TextField
              size="small"
              label="Custom member limit"
              type="number"
              inputProps={{ min: 1 }}
              value={customMaxUses}
              onChange={(e) => setCustomMaxUses(e.target.value)}
              fullWidth
            />
          )}

          {/* Button */}
          <Button
            fullWidth
            size="small"
            variant="contained"
            onClick={generateInviteLink}
            disabled={!canGenerate || loading}
          >
            {loading ? "Generating..." : "Generate Invite Link"}
          </Button>

          {/* Output */}
          {invite && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ wordBreak: 'break-all' }}
              >
                {invite.link}
              </Typography>

              <Stack direction="row" justifyContent="space-between">

                <IconButton size="small" onClick={copyValue}>
                  <ContentCopyOutlinedIcon fontSize="inherit" />
                </IconButton>
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
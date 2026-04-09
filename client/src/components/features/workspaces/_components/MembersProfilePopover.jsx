import {
  Popover,
  Box,
  Avatar,
  Typography,
  Stack,
  Divider,
  Chip,
  Link
} from '@mui/material'




export const MemberProfilePopover = ({
  anchorEl,
  onClose,
  member
}) => {

  const open = Boolean(anchorEl)

  if (!member) return null

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          width: 340,       
          overflow: 'hidden'
        }
      }}
    >
      <Box>

        <Box
          sx={{
            height: 80,
            bgcolor: 'primary.main'
          }}
        />

        <Box sx={{ px: 3, mt: -4 }}>
          <Avatar
            src={member.avatar ?? undefined}
            sx={{
              width: 72,      
              height: 72,
              border: '3px solid white',
              fontSize: 28
            }}
          >
            {member.name?.[0]}
          </Avatar>
        </Box>

        <Box sx={{ px: 3, pt: 1.5, pb: 2 }}>
          <Stack spacing={1}>

            <Typography fontWeight={600} fontSize={18}>
              {member.name ?? "Unnamed"}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center">
              <Chip label={member.role} size="small" />

              {member.profile?.availabilityStatus && (
                <Typography variant="caption" color="text.secondary">
                  • {member.profile.availabilityStatus}
                </Typography>
              )}
            </Stack>

          </Stack>
        </Box>

        <Divider />

        {member.profile?.about && (
          <Box sx={{ px: 3, py: 2 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {member.profile.about}
            </Typography>
          </Box>
        )}

        {(member.profile?.githubUrl ||
          member.profile?.linkedinUrl ||
          member.profile?.websiteUrl) && (
          <>
            <Divider />
            <Box sx={{ px: 3, py: 2 }}>
              <Stack spacing={1}>
                {member.profile?.githubUrl && (
                  <Link href={member.profile.githubUrl} target="_blank" underline="hover">
                    GitHub
                  </Link>
                )}

                {member.profile?.linkedinUrl && (
                  <Link href={member.profile.linkedinUrl} target="_blank" underline="hover">
                    LinkedIn
                  </Link>
                )}

                {member.profile?.websiteUrl && (
                  <Link href={member.profile.websiteUrl} target="_blank" underline="hover">
                    Website
                  </Link>
                )}
              </Stack>
            </Box>
          </>
        )}

        <Divider />
        <Box sx={{ px: 3, py: 2 }}>
          <Stack spacing={0.5}>

            {member.profile?.phone && (
              <Typography variant="caption">
                📞 {member.profile.phone}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </Typography>

          </Stack>
        </Box>

      </Box>
    </Popover>
  )
}
import { Box, CircularProgress, Typography, Stack } from '@mui/material'

export default function Loading({ text = '' }) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={32} />

        {text && (
          <Typography variant="body2" color="text.secondary">
            {text}
          </Typography>
        )}
      </Stack>
    </Box>
  )
}
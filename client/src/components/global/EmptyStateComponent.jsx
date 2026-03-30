import { Box, Typography, Stack, Button } from "@mui/material";

export default function EmptyStateComponent({
  message = "Nothing found.",
  secondaryText = "Try creating one to get started.",
  actionLabel,
  onActionClick,
  height = "100%",
}) {
  return (
    <Box
      sx={{
        height,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Stack spacing={1} alignItems="center" maxWidth={420}>
        <Box
          component="img"
          src="/images/empty-state.png"
          alt="Empty state"
          sx={{
            width: 180,
            opacity: 0.85,
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        <Typography variant="h6" fontWeight={600}>
          {message}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {secondaryText}
        </Typography>

        {actionLabel && onActionClick && (
          <Button variant="contained" onClick={onActionClick}>
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
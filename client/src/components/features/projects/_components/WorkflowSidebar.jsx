import { Box, Typography, Chip, Stack } from "@mui/material";

export default function WorkflowSidebar({ node }) {
  return (
    <Box
      sx={{
        width: 300,
        borderLeft: "1px solid",
        borderColor: "divider",
        p: 2,
        height: "100vh",
        position: "relative",
        backgroundColor: "background.paper",
      }}
    >
      {!node ? (
        <Typography color="text.secondary">
          Select a stage
        </Typography>
      ) : (
        <>
          <Typography fontWeight={600} mb={2}>
            Stage Settings
          </Typography>

          {/* Stage Name */}
          <Typography fontSize={12} color="text.secondary">
            Stage
          </Typography>
          <Typography mb={2}>{node.data.label}</Typography>

          {/* Allowed Roles */}
          <Typography fontSize={12} color="text.secondary">
            Can Work
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
            {node.data.allowedRoles?.length ? (
              node.data.allowedRoles.map((r) => (
                <Chip key={r} label={r} size="small" />
              ))
            ) : (
              <Typography fontSize={11}>No roles</Typography>
            )}
          </Stack>

          {/* Create Roles */}
          <Typography fontSize={12} color="text.secondary">
            Can Create
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {node.data.createRoles?.length ? (
              node.data.createRoles.map((r) => (
                <Chip key={r} label={r} size="small" color="primary" />
              ))
            ) : (
              <Typography fontSize={11}>No roles</Typography>
            )}
          </Stack>
        </>
      )}
    </Box>
  );
}
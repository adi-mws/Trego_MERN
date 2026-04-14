import { Drawer, Box, Typography, Chip, Stack } from "@mui/material";

export default function WorkflowSidebar({ node, onClose }) {
  return (
    <Drawer
      anchor="right"
      open={Boolean(node)}
      onClose={onClose}
    >
      <Box sx={{ width: 300, p: 2 }}>
        
        <Typography fontWeight={600} mb={2}>
          Stage Settings
        </Typography>

        {/* Stage Name */}
        <Typography fontSize={12} color="text.secondary">
          Stage
        </Typography>
        <Typography mb={2}>{node?.data?.label}</Typography>

        {/* Allowed Roles */}
        <Typography fontSize={12} color="text.secondary">
          Can Work
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" mb={2}>
          {node?.data?.allowedRoles?.map((r) => (
            <Chip key={r} label={r} size="small" />
          ))}
        </Stack>

        {/* Create Roles */}
        <Typography fontSize={12} color="text.secondary">
          Can Create
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {node?.data?.createRoles?.map((r) => (
            <Chip key={r} label={r} size="small" color="primary" />
          ))}
        </Stack>

      </Box>
    </Drawer>
  );
}
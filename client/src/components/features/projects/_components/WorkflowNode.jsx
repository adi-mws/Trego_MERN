import { useState } from "react";
import { Handle, Position } from "reactflow";
import {
  Card,
  Typography,
  Popover,
  Box,
  Chip,
  Stack,
} from "@mui/material";

export default function WorkflowNode({ data }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Card
        onClick={handleClick}
        variant="outlined"
        sx={{
          minWidth: 160,
          px: 1.5,
          py: 1,
          textAlign: "center",
          cursor: "pointer",
          position: "relative",

          backgroundColor: "#fff", // 🔥 critical
          display: "block",
        }}
      >
        {/* Handles */}
        <Handle type="target" position={Position.Top} style={{ zIndex: 10 }} />
        <Handle type="source" position={Position.Bottom} style={{ zIndex: 10 }} />
        <Handle type="target" position={Position.Left} style={{ zIndex: 10 }} />
        <Handle type="source" position={Position.Right} style={{ zIndex: 10 }} />

        <Typography fontSize={13} fontWeight={600}>
          {data.label}
        </Typography>
      </Card>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ p: 2, minWidth: 220 }}>
          <Typography fontSize={11} color="text.secondary">
            Can Work
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap" mb={1}>
            {data.allowedRoles?.length ? (
              data.allowedRoles.map((role) => (
                <Chip key={role} label={role} size="small" />
              ))
            ) : (
              <Typography fontSize={10}>No roles</Typography>
            )}
          </Stack>

          <Typography fontSize={11} color="text.secondary">
            Can Create
          </Typography>

          <Stack direction="row" spacing={0.5} flexWrap="wrap">
            {data.createRoles?.length ? (
              data.createRoles.map((role) => (
                <Chip key={role} label={role} size="small" color="primary" />
              ))
            ) : (
              <Typography fontSize={10}>No roles</Typography>
            )}
          </Stack>
        </Box>
      </Popover>
    </Box>
  );
}
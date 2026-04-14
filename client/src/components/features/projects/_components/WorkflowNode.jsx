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
    e.stopPropagation(); // prevents drag conflict
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* 🔥 NODE */}
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
        }}
      >
        {/* Handles */}
        <Handle type="target" position={Position.Top} />
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Left} />
        <Handle type="source" position={Position.Right} />

        {/* Label */}
        <Typography fontSize={13} fontWeight={600}>
          {data.label}
        </Typography>
      </Card>

      {/* 🔥 POPOVER */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        onClick={(e) => e.stopPropagation()} // 🔥 important
      >
        <Box sx={{ p: 2, minWidth: 220 }}>
          
          {/* Allowed Roles */}
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

          {/* Create Roles */}
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
    </>
  );
}
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

const connectionNodeStyle = {
  background: '#21ce21',
  width: '12px',          // Larger footprint
  height: '12px',
  borderRadius: '50%',    // Perfect circle
  border: '2px solid #ffffff',

};


export default function WorkflowNode({ data }) {


  return (
    <Box sx={{ position: "relative" }} style={{ background: '#222', color: '#ffffff' }}>
      <Card
        variant="outlined"
        sx={{
          minWidth: 160,
          px: 1.5,
          py: 1,
          textAlign: "center",
          cursor: "pointer",
          position: "relative",

          backgroundColor: "background.main",
          display: "block",
        }}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="left-in"
          style={{ ...connectionNodeStyle, left: "-6px" }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="right-out"
          style={{ ...connectionNodeStyle, right: "-6px" }} // Keep one invisible so the glow doesn't double up
        />



        <Typography fontSize={13} fontWeight={600}>
          {data.label}
        </Typography>
      </Card>

    </Box>
  );
}
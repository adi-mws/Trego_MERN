import { Box, Typography } from "@mui/material";
import SelectAllIcon from "@mui/icons-material/SelectAll";

export default function WorkflowNodesNotSelected() {
  return (
    <Box
      sx={{
        flex: 1,                
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 0,           
        p: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          border: "2px dashed",
          borderColor: "divider",   
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          color: "text.secondary",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "text.secondary",
            backgroundColor: "action.hover",
          },
        }}
      >
        <SelectAllIcon sx={{ fontSize: 40, opacity: 0.6 }} />

        <Typography variant="subtitle1" fontWeight={500}>
          No Selection
        </Typography>

        <Typography variant="body2">
          Select a node or edge to view details
        </Typography>
      </Box>
    </Box>
  );
}
import { Box, Popover } from "@mui/material";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

export default function ColorCirclePicker({ color, onChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [customColor, setCustomColor] = useState(null); 

  const open = Boolean(anchorEl);

  return (
    <>
      {/* Circle Trigger */}
      <Box
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: customColor || color || "transparent", 
          border: (customColor || color) ? "2px solid #000" : "2px dashed",
          borderColor: (customColor || color) ? (customColor || color) : "divider",
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            transform: "scale(1.1)",
          },
        }}
      />

      {/* Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            p: 2,
            backgroundColor: "background.paper",
            borderRadius: 2,
          }}
        >
          <HexColorPicker
            color={customColor || color || "#1890ff"}
            onChange={(newColor) => {
              setCustomColor(newColor);
              if (onChange) onChange(newColor);
            }}
          />
        </Box>
      </Popover>
    </>
  );
}
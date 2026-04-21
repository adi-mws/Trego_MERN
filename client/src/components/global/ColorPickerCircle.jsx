import { Box, Popover } from "@mui/material";
import { HexColorPicker } from "react-colorful";
import { useState } from "react";

export default function ColorCirclePicker({ setMeta }) {
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
          backgroundColor: customColor || "transparent", 
          border: customColor ? "2px solid #000" : "2px dashed",
          borderColor: customColor ? customColor : "divider",
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
            color={customColor || "#1890ff"}
            onChange={(color) => {
              setCustomColor(color);

              setMeta((prev) => ({
                ...prev,
                color,
              }));
            }}
          />
        </Box>
      </Popover>
    </>
  );
}
import React from "react";
import { Box, Typography, CircularProgress, useTheme } from "@mui/material";

export default function LoadingPage({message="Loading..."}) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: theme.palette.background.default,
        gap: 4,
        userSelect: "none",
      }}
    >

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress
          size={220} 
          thickness={3}
          
          sx={{
            color: theme.palette.primary.main,
          }}
        />
      </Box>

      <Typography
        variant="h6"
        sx={{
          color: theme.palette.text.secondary,
          textAlign: "center",
          letterSpacing: 0.5,
        }}
      >
        {message}...
      </Typography>

    </Box>
  );
}

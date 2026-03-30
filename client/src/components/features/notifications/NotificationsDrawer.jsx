"use client";

import * as React from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  IconButton,
  Divider,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";



export default function NotificationsDrawer({
  open,
  onClose,
  children,
}) {
  const theme = useTheme();
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        BackdropProps: {
          invisible: true,
        },
      }}
      slotProps={{
        paper: {
          sx: {
            width: 360,
            maxWidth: "100vw",
            height: "100vh",
            zIndex: 1500,
            boxShadow: "none",
            borderLeft: "1px solid",
            borderColor: "divider",
            backgroundColor: (theme) => theme.palette.background.paper,
          },
        },
      }}
    >
      {/* Header */}
      <Box px={2} py={2.1}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"

        >
          <Typography
            fontSize={14}
            fontWeight={600}
            textTransform="uppercase"
            letterSpacing={0.4}
          >
            Notifications
          </Typography>

          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      {/* Content */}
      <Box
        // bgcolor="background.paper"
        flex={1}
        overflow="auto"
        sx={{
          overscrollBehavior: "contain",
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
}

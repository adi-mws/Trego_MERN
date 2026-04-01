import {
  Dialog,
  Box,
  List,
  Typography,
  Stack,
  Divider,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PaletteIcon from "@mui/icons-material/Palette";
import DevicesIcon from "@mui/icons-material/Devices";
import SecurityIcon from "@mui/icons-material/Security";

import { useState } from "react";
import { useAccountDialog } from "../../../contexts/AccountDialogContext";

// Sections
import ProfileSection from "./_components/ProfileSection";
import PreferencesSection from "./_components/PreferencesSection";
import SecuritySection from "./_components/SecuritySection";
import LoggedInDevicesSection from "./_components/LoggedInDevicesSection.jsx";

const SECTIONS = [
  {
    key: "profile",
    label: "Profile",
    icon: <PersonIcon fontSize="small" />,
  },
  {
    key: "preferences",
    label: "Preferences",
    icon: <PaletteIcon fontSize="small" />,
  },
  {
    key: "devices",
    label: "Devices",
    icon: <DevicesIcon fontSize="small" />,
  },
  {
    key: "security",
    label: "Security",
    icon: <SecurityIcon fontSize="small" />,
  },
];

export default function AccountDialog() {
  const { open, closeDialog, setActive, active } = useAccountDialog();

  const profile = {};
  const avatarUrl = "";
  const onFileChange = () => {};

  const renderContent = () => {
    switch (active) {
      case "profile":
        return (
          <ProfileSection
            profile={profile}
            avatarUrl={avatarUrl}
            onFileChange={onFileChange}
          />
        );
      case "preferences":
        return <PreferencesSection />;
      case "devices":
        return <LoggedInDevicesSection />;
      case "security":
        return <SecuritySection />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={closeDialog} maxWidth="lg" fullWidth>
      <Box sx={{ display: "flex", height: 580, overflow: "hidden", position: "relative" }}>

        <IconButton
          onClick={closeDialog}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Sidebar */}
        <Box
          sx={{
            width: 240,
            borderRight: "1px solid #e0e0e0",
            p: 2,
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, px: 1 }}
          >
            Settings
          </Typography>

          <Stack gap={0.5}>
            {SECTIONS.map((item) => {
              const isActive = active === item.key;

              return (
                <Box
                  key={item.key}
                  onClick={() => setActive(item.key)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,

                    bgcolor: isActive ? "primary.main" : "transparent",
                    color: isActive
                      ? "primary.contrastText"
                      : "text.secondary",

                    transition:
                      "background-color 0.2s ease, color 0.2s ease",

                    "&:hover": {
                      bgcolor: isActive
                        ? "primary.main"
                        : "action.hover",
                      color: isActive
                        ? "primary.contrastText"
                        : "primary.main",
                    },

                    "& svg": {
                      fontSize: 18,
                      color: "inherit",
                    },
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              );
            })}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Typography fontSize={12} color="text.secondary">
            Manage your account and preferences.
          </Typography>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            p: 3,
            bgcolor: "background.default",
          }}
        >
          <Stack spacing={3}>{renderContent()}</Stack>
        </Box>
      </Box>
    </Dialog>
  );
}
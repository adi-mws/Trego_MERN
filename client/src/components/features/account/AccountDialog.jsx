import {
  Dialog,
  Box,
  Typography,
  Stack,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PaletteIcon from "@mui/icons-material/Palette";
import DevicesIcon from "@mui/icons-material/Devices";
import SecurityIcon from "@mui/icons-material/Security";

import { useAccountDialog } from "../../../contexts/AccountDialogContext";

// Sections
import ProfileSection from "./_components/ProfileSection";
import PreferencesSection from "./_components/PreferencesSection";
import LoggedInDevicesSection from "./_components/LoggedInDevicesSection.jsx";
import AccountSection from "./_components/AccountSection.jsx";
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
    key: "account",
    label: "Account",
    icon: <SecurityIcon fontSize="small" />,
  },
];

export default function AccountDialog() {
  const { open, closeDialog, setActive, active } = useAccountDialog();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
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
      case "account":
        return <AccountSection />;
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          height: { xs: "100dvh", sm: 620 },
          maxHeight: { xs: "100dvh", sm: "90dvh" },
          borderRadius: { xs: 0, sm: 3 },
          overflow: "hidden",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          height: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >

        <IconButton
          onClick={closeDialog}
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            bgcolor: "background.paper",
          }}
        >
          <CloseIcon />
        </IconButton>

        {/* Sidebar */}
        <Box
          sx={{
            width: { xs: "100%", md: 240 },
            borderRight: { xs: "none", md: "1px solid #e0e0e0" },
            borderBottom: { xs: "1px solid #e0e0e0", md: "none" },
            p: { xs: 1.25, md: 2 },
            bgcolor: "background.paper",
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontWeight: 600, px: 1 }}
          >
            Settings
          </Typography>

          <Stack
            direction={{ xs: "row", md: "column" }}
            gap={0.75}
            sx={{
              overflowX: { xs: "auto", md: "visible" },
              pb: { xs: 0.5, md: 0 },
            }}
          >
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
                    minWidth: { xs: 110, md: "auto" },
                    flexShrink: 0,

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
            p: { xs: 2, sm: 3 },
            bgcolor: "background.default",
            minWidth: 0,
          }}
        >
          <Stack spacing={{ xs: 2, sm: 3 }}>{renderContent()}</Stack>
        </Box>
      </Box>
    </Dialog>
  );
}

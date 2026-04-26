import { useState } from "react";
import {
  Avatar,
  Box,
  Menu,
  MenuItem,
  Stack,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import { AUTH_ROUTES } from "../../../lib/routes";
import { useNavigate } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { callApi } from "../../../api/api";
import { useAlert } from "../../../hooks/useAlert";
import { useUserGlobal } from "../../../hooks/useUserGlobal";
import { useAccountDialog } from "../../../contexts/AccountDialogContext";
import { getImageUrl } from "../../../utils/image.utils";

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { openDialog } = useAccountDialog();
  const { user, reset } = useUserGlobal();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const showAlert = useAlert();

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSignOut = async () => {
    const response = await callApi({ method: "POST", url: "/auth/sign-out" });

    if (response.success) {
      logout();
      reset();
      navigate(AUTH_ROUTES.signIn);
      showAlert(response.data?.message || "Signed out successfully", "success");
    } else {
      showAlert(response?.error?.message || "Error occurred", "error");
    }
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* Divider handled cleanly */}
      <Divider sx={{ mb: 1 }} />

      {/* USER BUTTON (FULL WIDTH) */}
      <Button
        onClick={handleOpen}
        fullWidth
        sx={{
          justifyContent: "space-between",
          textTransform: "none",
          px: 1.5,
          py: 1,
          borderRadius: 1,
          color: "text.primary",
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: 12,
              fontWeight: 600,
            }}
            src={getImageUrl(user?.avatar) || undefined}
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
          </Avatar>

          <Box sx={{ textAlign: 'left' }}>
            <Typography fontSize={13} fontWeight={500}>
              {user?.name || "User"}
            </Typography>
            <Typography fontSize={11} color="text.secondary">
              {user?.email || ""}
            </Typography>
          </Box>
        </Stack>

        <KeyboardArrowDownIcon
          fontSize="small"
          sx={{
            color: "text.secondary",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "0.2s",
          }}
        />
      </Button>

      {/* DROPDOWN MENU */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: -1,
            minWidth: 240,
            borderRadius: 2,
          },
        }}
      >
        {/* Profile Info */}
        <Box sx={{ px: 2, py: 2 }}>
          <Typography fontSize={14} fontWeight={600}>
            {user?.name || "User"}
          </Typography>
          <Typography fontSize={12} color="text.secondary">
            {user?.email || "No email"}
          </Typography>
        </Box>

        <Divider />

        <MenuItem onClick={() => { handleClose(); openDialog("profile") }}>
          Profile
        </MenuItem>

        <MenuItem onClick={() => { handleClose(); openDialog("preferences") }}>
          Preferences
        </MenuItem>

        <MenuItem onClick={() => { handleClose(); openDialog("devices") }}>
          Devices
        </MenuItem>

        <MenuItem onClick={() => { handleClose(); openDialog("account") }}>
          Account
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            handleSignOut();
            handleClose();
          }}
          sx={{ color: "error.main", fontWeight: 500 }}
        >
          Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}

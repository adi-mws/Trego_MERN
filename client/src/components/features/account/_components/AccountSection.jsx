import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  Divider,
  Grid,
  Chip,
  IconButton,
  InputAdornment,
} from "@mui/material";

import SectionHeader from "./SectionHeader";
import { WarningAmber, Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";

function AccountSection() {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggle = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getAdornment = (field) => (
    <InputAdornment position="end">
      <IconButton onClick={() => toggle(field)} edge="end">
        {showPassword[field] ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <Box>
      <Box p={3}>
        <SectionHeader
          title="Account"
          description="Actions related to your account"
        />

        <Typography fontWeight={600} mb={1.5}>
          Change password
        </Typography>

        <Stack spacing={2} maxWidth={420}>
          <TextField
            label="Current password"
            placeholder="Enter current password"
            type={showPassword.current ? "text" : "password"}
            size="small"
            InputProps={{
              endAdornment: getAdornment("current"),
            }}
          />

          <TextField
            label="New password"
            placeholder="Enter new password"
            type={showPassword.new ? "text" : "password"}
            size="small"
            InputProps={{
              endAdornment: getAdornment("new"),
            }}
          />

          <TextField
            label="Confirm new password"
            placeholder="Enter confirm password"
            type={showPassword.confirm ? "text" : "password"}
            size="small"
            InputProps={{
              endAdornment: getAdornment("confirm"),
            }}
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end" mt={3}>
          <Button size="small" variant="contained">
            Update password
          </Button>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography fontWeight={600} mb={0.5} color="error">
          Danger Zone
        </Typography>

        <Typography fontSize={14} color="text.secondary" mb={2}>
          Delete your account
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid size={12}>
            <Chip
              sx={{ px: 2 }}
              icon={<WarningAmber sx={{ fontSize: 18 }} />}
              label="Delete Account – This action is permanent"
              color="error"
              variant="outlined"
            />
          </Grid>

          <Grid size={12}>
            <Typography variant="body2" color="text.secondary">
              Deleting your account is irreversible. All your personal data will
              be permanently removed. If you own any servers, their ownership
              will be automatically transferred to another eligible member.
            </Typography>
          </Grid>

          <Grid size={12}>
            <Box mt={1}>
              <Button variant="contained" size="small" color="error">
                Delete Account
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default AccountSection;
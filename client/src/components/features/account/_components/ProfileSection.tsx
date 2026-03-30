import {
  Stack,
  Box,
  Avatar,
  IconButton,
  Chip,
  TextField,
  Card,
  Button,
  CircularProgress,
  Typography,
  Divider,
  MenuItem,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useState, useEffect } from "react";
import SectionHeader from "./SectionHeader";

const availabilityOptions = [
  "AVAILABLE",
  "FOCUSED",
  "BUSY",
  "AWAY",
  "DO_NOT_DISTURB",
];

function ProfileSection({ profile, avatarUrl, onFileChange }: any) {
  const [form, setForm] = useState(profile);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsDirty(JSON.stringify(form) !== JSON.stringify(profile));
  }, [form, profile]);

  const handleSave = async () => {
    try {
      setLoading(true);


      await new Promise((res) => setTimeout(res, 1000));

      setIsDirty(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm(profile);
    setIsDirty(false);
  };

  return (
    <Card
      variant="outlined"
      id="profile"
      sx={{
        borderRadius: 3,
        backdropFilter: "blur(10px)",
      }}
    >
      <Box p={4}>
        <SectionHeader
          title="Profile"
          description="Manage your identity and personal details"
        />

        <Stack spacing={4}>
          {/* Avatar Section */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            alignItems="center"
          >
            <Box textAlign="center">
              <Avatar
                src={avatarUrl ?? undefined}
                sx={{ width: 96, height: 96 }}
              >
                {/* {data?.user?.name ? data.user.name.charAt(0).toUpperCase() : "U"} */}
              </Avatar>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="avatar-upload"
                type="file"
                onChange={onFileChange}
              />
              <label htmlFor="avatar-upload">
                <IconButton component="span" size="small">
                  <PhotoCameraIcon />
                </IconButton>
              </label>

              <Chip
                icon={<VerifiedIcon />}
                label="Email verified"
                color="success"
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>

            <Stack flex={1} spacing={2}>
              <TextField
                label="Full name"
                size="small"
                value={form.name || ""}
                onChange={(e) =>
                  setForm((p: any) => ({ ...p, name: e.target.value }))
                }
                fullWidth
              />

              <TextField
                label="Email address"
                size="small"
                value={form.email}
                disabled
                helperText="Email cannot be changed"
                fullWidth
              />
            </Stack>
          </Stack>

          <Divider />

          {/* About */}
          <TextField
            label="About"
            size="small"
            multiline
            rows={3}
            value={form.about || ""}
            onChange={(e) =>
              setForm((p: any) => ({ ...p, about: e.target.value }))
            }
            fullWidth
          />

          {/* Contact */}
          <TextField
            label="Phone number"
            size="small"
            value={form.phone || ""}
            onChange={(e) =>
              setForm((p: any) => ({ ...p, phone: e.target.value }))
            }
            fullWidth
          />

          {/* Availability */}
          <TextField
            select
            label="Availability status"
            size="small"
            value={form.availabilityStatus}
            onChange={(e) =>
              setForm((p: any) => ({
                ...p,
                availabilityStatus: e.target.value,
              }))
            }
            fullWidth
          >
            {availabilityOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {status.replaceAll("_", " ")}
              </MenuItem>
            ))}
          </TextField>

          <Divider />

          {/* Social Links */}
          <Typography variant="subtitle2" color="text.secondary">
            Social & Professional Links
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="GitHub URL"
              size="small"
              value={form.githubUrl || ""}
              onChange={(e) =>
                setForm((p: any) => ({ ...p, githubUrl: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="LinkedIn URL"
              size="small"
              value={form.linkedinUrl || ""}
              onChange={(e) =>
                setForm((p: any) => ({ ...p, linkedinUrl: e.target.value }))
              }
              fullWidth
            />

            <TextField
              label="Website URL"
              size="small"
              value={form.websiteUrl || ""}
              onChange={(e) =>
                setForm((p: any) => ({ ...p, websiteUrl: e.target.value }))
              }
              fullWidth
            />
          </Stack>

          {/* Save / Cancel */}
          {isDirty && (
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                size="small"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  "Save changes"
                )}
              </Button>
            </Stack>
          )}
        </Stack>
      </Box>
    </Card>
  );
}

export default ProfileSection;

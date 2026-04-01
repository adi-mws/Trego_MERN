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
} from "@mui/material";

import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import VerifiedIcon from "@mui/icons-material/Verified";

import { useState, useEffect } from "react";
import SectionHeader from "./SectionHeader";
import { useUserGlobal } from "../../../../hooks/useUserGlobal";
import { callApi } from "../../../../api/api";

function ProfileSection() {
  const { user, updateUser } = useUserGlobal();

  const [form, setForm] = useState({
    name: "",
    about: "",
    avatar: "",
    githubUrl: "",
    linkedinUrl: "",
    facebookUrl: "",
  });

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync form with Redux user
  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      about: user.about || "",
      avatar: user.avatar || "",
      githubUrl: user.profile?.githubUrl || "",
      linkedinUrl: user.profile?.linkedinUrl || "",
      facebookUrl: user.profile?.facebookUrl || "",
    });
  }, [user]);

  // Detect changes
  useEffect(() => {
    if (!user) return;

    const original = {
      name: user.name || "",
      about: user.about || "",
      avatar: user.avatar || "",
      githubUrl: user.profile?.githubUrl || "",
      linkedinUrl: user.profile?.linkedinUrl || "",
      facebookUrl: user.profile?.facebookUrl || "",
    };

    setIsDirty(JSON.stringify(form) !== JSON.stringify(original));
  }, [form, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {};

      if (form.name !== user.name) payload.name = form.name;
      if (form.about !== user.about) payload.about = form.about;
      if (form.avatar !== user.avatar) payload.avatar = form.avatar;

      if (form.githubUrl !== user.profile?.githubUrl)
        payload.githubUrl = form.githubUrl;

      if (form.linkedinUrl !== user.profile?.linkedinUrl)
        payload.linkedinUrl = form.linkedinUrl;

      if (form.facebookUrl !== user.profile?.facebookUrl)
        payload.facebookUrl = form.facebookUrl;

      if (Object.keys(payload).length === 0) return;

      const res = await callApi({
        method: "PUT",
        url: "/user/profile",
        data: payload,
      });

      if (res?.success) {
        updateUser(res.data.data);
        setForm({
          name: res.data.name || "",
          about: res.data.about || "",
          avatar: res.data.avatar || "",
          githubUrl: res.data.profile?.githubUrl || "",
          linkedinUrl: res.data.profile?.linkedinUrl || "",
          facebookUrl: res.data.profile?.facebookUrl || "",
        });

        setIsDirty(false);
      }
    } catch (err) {
      setError(err?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    if (!user) return;

    setForm({
      name: user.name || "",
      about: user.about || "",
      avatar: user.avatar || "",
      githubUrl: user.profile?.githubUrl || "",
      linkedinUrl: user.profile?.linkedinUrl || "",
      facebookUrl: user.profile?.facebookUrl || "",
    });

    setIsDirty(false);
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <Box p={4}>
        <SectionHeader
          title="Profile"
          description="Manage your identity and personal details"
        />

        <Stack spacing={4}>
          {/* Avatar */}
          <Stack direction="row" spacing={3} alignItems="center">
            <Box textAlign="center">
              <Avatar
                src={form.avatar || undefined}
                sx={{ width: 96, height: 96 }}
              >
                {form.name?.[0]}
              </Avatar>

              <input
                accept="image/*"
                style={{ display: "none" }}
                id="avatar-upload"
                type="file"
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
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                fullWidth
              />

              <TextField
                label="Email"
                size="small"
                value={user?.email || ""}
                disabled
                fullWidth
              />
            </Stack>
          </Stack>

          <Divider />

          {/* About */}
          <TextField
            label="About"
            multiline
            rows={3}
            size="small"
            value={form.about}
            onChange={(e) =>
              setForm((p) => ({ ...p, about: e.target.value }))
            }
            fullWidth
          />

          <Divider />

          {/* Social Links */}
          <Typography variant="subtitle2" color="text.secondary">
            Social Links
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="GitHub"
              size="small"
              value={form.githubUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, githubUrl: e.target.value }))
              }
            />

            <TextField
              label="LinkedIn"
              size="small"
              value={form.linkedinUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, linkedinUrl: e.target.value }))
              }
            />

            <TextField
              label="Facebook"
              size="small"
              value={form.facebookUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, facebookUrl: e.target.value }))
              }
            />
          </Stack>

          {/* Actions */}
          {isDirty && (
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                size="small"
                variant="outlined"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                size="small"
                variant="contained"
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

          {error && (
            <Typography color="error" variant="caption">
              {error}
            </Typography>
          )}
        </Stack>
      </Box>
    </Card>
  );
}

export default ProfileSection;
import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { PhotoCamera, Save } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { callApi } from "../../../api/api";
import { useSnackbar } from "notistack";
import { useParams } from "react-router-dom";

export default function WorkspaceSettingsPage() {
  const { workspaceSlug } = useParams();
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const workspace = useSelector((s) => s.workspace);
  const loading = useSelector((s) => s.workspace.loading);

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (workspace._id) {
      setName(workspace.name || "");
      setAbout(workspace.about || "");
      setAvatarPreview(workspace.avatar || "");
    }
  }, [workspace]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      enqueueSnackbar("Workspace name is required", { variant: "error" });
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("about", about.trim());
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    console.log(Object.fromEntries(formData));
    const res = await callApi({
      method: "put",
      url: `/workspaces/${workspace._id}`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    setSaving(false);

    if (res.success) {
      enqueueSnackbar("Workspace settings updated successfully", {
        variant: "success",
      });
      // Refresh workspace state via API to avoid page refresh
      const freshRes = await callApi({
        url: `/workspaces/global/${workspaceSlug || res.data?.workspace?.slug}`,
      });

      console.log(freshRes.data)
      if (freshRes.success) {
        dispatch({ type: "workspace/setWorkspace", payload: freshRes.data.workspace });
      } 
    } else {
      enqueueSnackbar(res.message || "Failed to update workspace", {
        variant: "error",
      });
    }
  };

  if (loading || !workspace._id) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, width: "100%", mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Workspace Settings
      </Typography>

      <Box sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Avatar Upload */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Workspace Logo / Avatar
              </Typography>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box position="relative">
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 80, height: 80, fontSize: 32 }}
                  >
                    {name ? name[0] : "W"}
                  </Avatar>
                  <IconButton
                    color="primary"
                    sx={{
                      position: "absolute",
                      bottom: -8,
                      right: -8,
                      bgcolor: "background.paper",
                      boxShadow: 1,
                      "&:hover": { bgcolor: "background.paper" },
                    }}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Box>
                <Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => fileInputRef.current.click()}
                  >
                    Change Logo
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    Recommended size: 400x400px. JPG, PNG or WEBP.
                  </Typography>
                </Box>
                <input
                  type="file"
                  hidden
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarChange}
                />
              </Stack>
            </Box>

            {/* Basic Info */}
            <Box>
              <TextField
                fullWidth
                label="Workspace Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="About Workspace"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                multiline
                rows={4}
              />
            </Box>

            {/* Actions */}
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                onClick={handleSave}
                disabled={saving}
                sx={{ borderRadius: 2 }}
              >
                Save Changes
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Box>
    </Box>
  );
}

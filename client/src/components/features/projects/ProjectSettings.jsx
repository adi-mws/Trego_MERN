import React, { useState, useRef } from "react";
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

export default function ProjectSettings() {
  const project = useSelector((s) => s.project);
  const dispatch = useDispatch();
  const { workspaceSlug, projectSlug } = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  // Initialize form state securely
  React.useEffect(() => {
    if (project._id) {
      setName(project.name || "");
      setDescription(project.description || "");
      setAvatarPreview(project.avatar || "");
    }
  }, [project]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      enqueueSnackbar("Project name is required", { variant: "error" });
      return;
    }

    setSaving(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("description", description.trim());
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const res = await callApi({
      method: "put",
      url: `/projects/${project._id}`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (res.success) {
      enqueueSnackbar("Project settings updated successfully", {
        variant: "success",
      });
      
      // Fetch updated global state without refreshing page
      const freshRes = await callApi({
        url: `/projects/global/${project.slug || projectSlug}`,
      });
      if (freshRes.success) {
        // We need to import setProject from projectSlice to dispatch this
        dispatch({ type: "project/setProject", payload: freshRes.data });
      }
    } else {
      enqueueSnackbar(res.message || "Failed to update project", {
        variant: "error",
      });
    }
    setSaving(false);
  };

  if (project.isLoading || !project._id) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Project Settings
      </Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={4}>
            {/* Avatar Upload */}
            <Box>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Project Logo / Avatar
              </Typography>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box position="relative">
                  <Avatar
                    src={avatarPreview}
                    sx={{ width: 80, height: 80, fontSize: 32 }}
                  >
                    {name ? name[0] : "P"}
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
                label="Project Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Project Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
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
      </Card>
    </Box>
  );
}

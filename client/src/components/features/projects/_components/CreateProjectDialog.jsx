import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Stack,
  Avatar,
  Box,
  Typography,
  IconButton,
} from "@mui/material";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useForm } from "react-hook-form";
import { callApi } from "../../../../api/api";

export default function CreateProjectDialog({
  open,
  onClose,
  workspaceId,
  onCreated,
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const nameValue = watch("name");

  // -------- IMAGE --------
  const handleImageChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    const previewUrl = URL.createObjectURL(selected);
    setPreview(previewUrl);
  };

  // cleanup preview
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // -------- RESET --------
  const handleClose = () => {
    reset();
    setPreview(null);
    setFile(null);
    onClose && onClose();
  };

  // -------- SUBMIT --------
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("workspaceId", workspaceId);

      if (file) {
        formData.append("avatar", file);
      }

      const res = await callApi({
        method: "POST",
        url: "/projects",
        data: formData,
        isFormData: true,
      });

      if (res.success) {
        onCreated && onCreated(res.data.project);
        handleClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // -------- RENDER --------
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create Project</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} mt={1}>

            {/* Avatar Upload */}
            <Stack alignItems="center" spacing={1}>
              <Box position="relative">
                <Avatar
                  src={preview || undefined}
                  sx={{ width: 90, height: 90, fontSize: 32 }}
                >
                  {!preview && nameValue?.[0]?.toUpperCase()}
                </Avatar>

                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "background.paper",
                  }}
                >
                  <PhotoCamera fontSize="small" />
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </IconButton>
              </Box>

              <Typography variant="caption" color="text.secondary">
                Upload project avatar
              </Typography>
            </Stack>

            {/* Name */}
            <TextField
              label="Project Name"
              placeholder="Enter project name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name", {
                required: "Project name is required",
                minLength: {
                  value: 2,
                  message: "Minimum 2 characters required",
                },
              })}
            />

            {/* Description */}
            <TextField
              label="Description"
              placeholder="Describe your project"
              fullWidth
              multiline
              minRows={3}
              {...register("description")}
            />

            {/* Preview hint (optional like workspace slug) */}
            {nameValue && (
              <Typography variant="caption" color="text.secondary">
                Project will be created inside this workspace
              </Typography>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              loading={isSubmitting}
              fullWidth
            >
             Create Project
            </Button>

          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
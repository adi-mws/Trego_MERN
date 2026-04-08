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
import { useAlert } from "../../../../hooks/useAlert";

export default function CreateWorkspaceDialog({
  open,
  onClose,
  onWorkspaceCreation,
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
  const [errorMsg, setErrorMsg] = useState("");

  const nameValue = watch("name");

  /* IMAGE */

  const handleImageChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);

    const previewUrl = URL.createObjectURL(selected);
    setPreview(previewUrl);
  };

  // cleanup preview URL 
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* SLUG */

  const generateSlug = (name) => {
    return name
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  /* RESET */

  const handleClose = () => {
    reset();
    setPreview(null);
    setFile(null);
    setErrorMsg("");
    onClose();
  };
  const showAlert = useAlert();

  /* SUBMIT */

  const onSubmit = async (data) => {
    await onWorkspaceCreation(data, file)
  };

  /* RENDER */

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create Workspace</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} mt={1}>
            {/* Avatar Upload */}
            <Stack alignItems="center" spacing={1}>
              <Box position="relative">
                <Avatar
                  src={preview || undefined}
                  sx={{ width: 90, height: 90, fontSize: 32 }}
                />

                <IconButton
                  component="label"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    background: "#fff",
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
                Upload workspace avatar
              </Typography>
            </Stack>

            {/* Name */}
            <TextField
              label="Workspace Name"
              placeholder="Enter workspace name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              {...register("name", {
                required: "Workspace name is required",
                minLength: {
                  value: 2,
                  message: "Minimum 2 characters required",
                },
              })}
            />

            {/* About */}
            <TextField
              label="About"
              placeholder="Describe your workspace"
              fullWidth
              multiline
              minRows={3}
              {...register("about")}
            />

            {/* Slug Preview */}
            {nameValue && (
              <Typography variant="caption" color="text.secondary">
                URL: /workspace/{generateSlug(nameValue)}
              </Typography>
            )}

            {/* Error */}
            {errorMsg && (
              <Typography color="error" variant="caption">
                {errorMsg}
              </Typography>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting ? "Creating..." : "Create Workspace"}
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
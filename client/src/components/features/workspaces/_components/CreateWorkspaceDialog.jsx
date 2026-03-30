import React, { useState } from "react";
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

export default function CreateWorkspaceDialog({
  open,
  onClose,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);

  const handleImageChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };


  const onSubmit = async (data) => {
    // todo: data submission
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Create Workspace</DialogTitle>

      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3} mt={1}>

            {/* Avatar Upload */}
            <Stack alignItems="center" spacing={1}>
              <Box position="relative">
                <Avatar
                  src={preview ?? undefined}
                  sx={{
                    width: 90,
                    height: 90,
                    fontSize: 32,
                  }}
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
              slotProps={{
                input: {
                  ...register("name", {
                    required: "Workspace name is required",
                    minLength: {
                      value: 2,
                      message: "Minimum 2 characters required",
                    },
                  }),
                },
              }}
            />

            {/* About */}
            <TextField
              label="About"
              placeholder="Describe your workspace"
              fullWidth
              multiline
              minRows={3}
              slotProps={{
                input: {
                  ...register("about"),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              loading={isSubmitting}
              fullWidth
            >
              Create Workspace
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
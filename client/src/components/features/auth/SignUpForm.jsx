"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
  Link
} from "@mui/material";
import { Visibility, VisibilityOff, PersonAddOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    setError: setFormError,
    formState: { errors },
  } = useForm();
  const password = watch("password");

 


  const onSubmit = (data) => {
    console.log(data)
  };


  return (
    <Box
      minHeight="100dvh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      px={2}
      bgcolor="background.default"
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 360,
          p: 2.5,
          borderRadius: 2.5,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Header */}
        <Box textAlign="center" mb={2}>
          <Box
            mx="auto"
            mb={1}
            display="flex"
            alignItems="center"
            justifyContent="center"
            width={40}
            height={40}
            borderRadius="50%"
            bgcolor="primary.main"
            color="primary.contrastText"
          >
            <PersonAddOutlined fontSize="small" />
          </Box>

          <Typography fontWeight={600} fontSize={18}>
            Create your account
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Start building with Trego
          </Typography>
        </Box>

        {/* Google */}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={() => setGoogleLoading(true)}
          disabled={googleLoading}
          sx={{ height: 40, textTransform: "none", fontWeight: 500 }}
        >
          {googleLoading ? <CircularProgress size={18} /> : "Sign up with Google"}
        </Button>

        <Divider sx={{ my: 1.8 }}>
          <Typography variant="caption" color="text.secondary">
            or
          </Typography>
        </Divider>

        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            size="small"
            margin="dense"
            label="Full name"
            placeholder="John Doe"
            fullWidth
            {...register("name", { required: "Name required" })}
            error={!!errors.name}
            helperText={errors.name?.message}
          />

          <TextField
            size="small"
            margin="dense"
            placeholder="example@gmail.com"
            label="Email"
            fullWidth
            {...register("email", { required: "Email required" })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            size="small"
            margin="dense"
            placeholder="pass_key_1234"
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            {...register("password", {
              required: "Password required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message:
                  "Password must contain at least one uppercase letter, one lowercase letter, and one number",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(v => !v)}
                  >
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            size="small"
            margin="dense"
            placeholder="pass_key_1234"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: value =>
                value === password || "Passwords do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowConfirmPassword(v => !v)}
                  >
                    {showConfirmPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />



          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="small"
            disabled={mutation.isPending}
            sx={{ height: 40, mt: 1.5, textTransform: "none", fontWeight: 600 }}
          >
            {mutation.isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Create account"
            )}
          </Button>
        </Box>

        {/* Footer */}
        <Box textAlign="center" mt={2}>
          <Box textAlign="center" mt={2}>
            <Typography variant="caption" color="text.secondary">
              Already have an account?{" "}
              <Link
                component={NextLink}
                href="/sign-in"
                variant="caption"
                underline="none"
                sx={{ fontWeight: 600 }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

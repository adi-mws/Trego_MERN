import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link as NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { callApi } from "../../../api/api";
import { AUTH_ROUTES } from "../../../lib/routes";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    setError("");

    const response = await callApi({
      method: "POST",
      url: "/auth/reset-password",
      data: {
        email: data.email,
        token,
        password: data.password,
      },
    });

    if (response.success) {
      setMessage(response.data?.message || "Password reset successfully.");
      window.setTimeout(() => navigate(AUTH_ROUTES.signIn), 1200);
    } else {
      setError(response.error?.message || "Could not reset password.");
    }

    setLoading(false);
  };

  const missingToken = !token;

  return (
    <Box minHeight="100dvh" display="flex" alignItems="center" justifyContent="center" px={2} bgcolor="background.default">
      <Paper elevation={0} sx={{ width: "100%", maxWidth: 380, p: 2.5, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
        <Box textAlign="center" mb={2}>
          <Box mx="auto" mb={1} display="flex" alignItems="center" justifyContent="center" width={40} height={40} borderRadius="50%" bgcolor="primary.main" color="primary.contrastText">
            <LockResetOutlinedIcon fontSize="small" />
          </Box>
          <Typography fontWeight={600} fontSize={18}>
            Reset password
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Choose a new password for your local account
          </Typography>
        </Box>

        {missingToken && <Alert severity="error" sx={{ mb: 1.5 }}>This reset link is missing a token.</Alert>}
        {message && <Alert severity="success" sx={{ mb: 1.5 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Email"
            margin="dense"
            fullWidth
            {...register("email", { required: "Email required" })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            margin="dense"
            label="New password"
            type={showPassword ? "text" : "password"}
            fullWidth
            {...register("password", {
              required: "Password required",
              minLength: { value: 8, message: "Password must be at least 8 characters" },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                message: "Password must contain uppercase, lowercase, and number",
              },
            })}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowPassword((value) => !value)}>
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            margin="dense"
            label="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            fullWidth
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value, formValues) => value === formValues.password || "Passwords do not match",
            })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setShowConfirmPassword((value) => !value)}>
                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" fullWidth variant="contained" disabled={loading || missingToken} sx={{ height: 40, mt: 1.5, textTransform: "none", fontWeight: 600 }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : "Reset password"}
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Link component={NavLink} to={AUTH_ROUTES.signIn} variant="caption" underline="none" sx={{ fontWeight: 600 }}>
            Back to sign in
          </Link>
        </Box>
      </Paper>
    </Box>
  );
}

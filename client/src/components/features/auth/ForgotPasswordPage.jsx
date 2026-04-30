import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Link,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { Link as NavLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { callApi } from "../../../api/api";
import { AUTH_ROUTES } from "../../../lib/routes";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage("");
    setError("");

    const response = await callApi({
      method: "POST",
      url: "/auth/forgot-password",
      data,
    });

    if (response.success) {
      setMessage(response.data?.message || "If the account exists, a reset link has been sent.");
    } else {
      setError(response.error?.message || "Could not send reset email.");
    }

    setLoading(false);
  };

  return (
    <Box minHeight="100dvh" display="flex" alignItems="center" justifyContent="center" px={2} bgcolor="background.default">
      <Paper elevation={0} sx={{ width: "100%", maxWidth: 380, p: 2.5, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
        <Box textAlign="center" mb={2}>
          <Box mx="auto" mb={1} display="flex" alignItems="center" justifyContent="center" width={40} height={40} borderRadius="50%" bgcolor="primary.main" color="primary.contrastText">
            <MarkEmailReadOutlinedIcon fontSize="small" />
          </Box>
          <Typography fontWeight={600} fontSize={18}>
            Forgot password
          </Typography>
          <Typography variant="caption" color="text.secondary">
            We'll email a secure reset link for local accounts
          </Typography>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 1.5 }}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Email"
            placeholder="example@gmail.com"
            margin="dense"
            fullWidth
            {...register("email", {
              required: "Email required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email",
              },
            })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ height: 40, mt: 1.5, textTransform: "none", fontWeight: 600 }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : "Send reset link"}
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

import { useCallback, useEffect, useState } from "react";
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
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Link as NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { APP_ROUTES, AUTH_ROUTES } from "../../../lib/routes";
import { callApi } from "../../../api/api";
import { useAlert } from "../../../hooks/useAlert";
import useAuth from "../../../hooks/useAuth";
import { useDeviceInfo } from "../../../hooks/useDeviceInfo";
import { GoogleLogin } from "@react-oauth/google";


export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const deviceInfo = useDeviceInfo();
  const { login } = useAuth();
  const navigate = useNavigate();
  const showAlert = useAlert();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleGoogleCredential = useCallback(async (idToken) => {
    if (!idToken) {
      setError("Google sign-in failed");
      return;
    }

    setGoogleLoading(true);
    setError(null);

    try {
      const response = await callApi({
        method: "POST",
        url: "/auth/google",
        data: {
          idToken,
          deviceInfo: {
            deviceId: deviceInfo.deviceId,
            ip: deviceInfo.ipAddress,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            userAgent: deviceInfo.userAgent,
          },
        },
      });

      if (response.success) {
        login(response?.data?.data || response?.data);
        showAlert(response.data?.message || "Signed in with Google", "success");
        navigate(redirect || APP_ROUTES.root);
      } else {
        setError(response?.error?.message || "Google sign-in failed");
      }
    } finally {
      setGoogleLoading(false);
    }
  }, [deviceInfo.browser, deviceInfo.deviceId, deviceInfo.ipAddress, deviceInfo.os, deviceInfo.userAgent, login, navigate, redirect, showAlert]);

  useEffect(() => {
    if (deviceInfo.deviceId) {
      setError(null);
    }
  }, [deviceInfo.deviceId]);

  const onSubmit = async (data) => {
    setLoading(true);
    const response = await callApi({
      method: "POST",
      url: "/auth/sign-in",
      data: {
        ...data,
        deviceInfo: {
          deviceId: deviceInfo.deviceId,
          ip: deviceInfo.ipAddress,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          userAgent: deviceInfo.userAgent,
        },
      },
    });

    if (response.success) {
      login(response?.data?.data || response?.data);
      showAlert(response.data?.message, "success");
      navigate(redirect || APP_ROUTES.root);
    } else {
      setError(response?.error?.message || "An error occurred. Please try again.");
    }

    setLoading(false);
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
            <LockOutlined fontSize="small" />
          </Box>

          <Typography fontWeight={600} fontSize={18}>
            Sign in to Trego
          </Typography>

          <Typography variant="caption" color="text.secondary">
            AI-powered project execution
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pointerEvents: !deviceInfo.deviceId || googleLoading ? "none" : "auto",
            opacity: !deviceInfo.deviceId || googleLoading ? 0.6 : 1,
          }}
        >
          {googleLoading ? (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={40}
            >
              <CircularProgress size={18} />
            </Box>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                handleGoogleCredential(credentialResponse.credential);
              }}
              onError={() => setError("Google sign-in failed")}
              width="310"
              text="continue_with"
            />
          )}
        </Box>

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

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Email"
            placeholder="example@gmail.com"
            margin="dense"
            fullWidth
            {...register("email", { required: "Email required" })}
            error={!!errors.email}
            helperText={errors.email?.message}
          />

          <TextField
            margin="dense"
            placeholder="pass_key_1234"
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            {...register("password", { required: "Password required" })}
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword((v) => !v)}
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

          <Box display="flex" justifyContent="flex-end" mt={0.5} mb={1.5}>
            <Link
              component={NavLink}
              to={AUTH_ROUTES.forgotPassword}
              variant="caption"
              underline="none"
              color="primary.main"
              fontWeight={500}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="small"
            disabled={loading}
            sx={{ height: 40, textTransform: "none", fontWeight: 600 }}
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Sign In"
            )}
          </Button>
        </Box>

        <Box textAlign="center" mt={2}>
          <Typography variant="caption" color="text.secondary">
            New here?{" "}
            <Link
              component={NavLink}
              to={
                redirect
                  ? `${AUTH_ROUTES.signUp}?redirect=${redirect}`
                  : AUTH_ROUTES.signUp
              }
              variant="caption"
              underline="none"
              color="primary.main"
              fontWeight={600}
              sx={{ "&:hover": { textDecoration: "underline" } }}
            >
              Get started
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

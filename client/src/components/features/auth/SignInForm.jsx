import { useState, useEffect } from "react";
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
import crypto from "crypto";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Link as NavLink, useNavigate } from "react-router-dom";
import { APP_ROUTES, AUTH_ROUTES } from "../../../lib/routes";
import { callApi } from "../../../api/api";
import { useAlert } from "../../../hooks/useAlert";
import useAuth from "../../../hooks/useAuth";

export default function SignInForm() {

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  const [deviceId, setDeviceId] = useState("");
  const [ipAddress, setIpAddress] = useState("");
  const [browser, setBrowser] = useState("");
  const [os, setOs] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const showAlert = useAlert();
  useEffect(() => {
    let id = localStorage.getItem("deviceId");

    if (!id) {
      id = crypto.randomUUID(); // modern browsers
      localStorage.setItem("deviceId", id);
    }

    setDeviceId(id);
    // User Agent
    const ua = navigator.userAgent;
    setUserAgent(ua);

    // Detect OS
    if (ua.includes("Windows")) setOs("Windows");
    else if (ua.includes("Mac")) setOs("MacOS");
    else if (ua.includes("Linux")) setOs("Linux");
    else if (ua.includes("Android")) setOs("Android");
    else if (ua.includes("iPhone")) setOs("iOS");
    else setOs("Unknown");

    // Detect Browser
    if (ua.includes("Chrome")) setBrowser("Chrome");
    else if (ua.includes("Firefox")) setBrowser("Firefox");
    else if (ua.includes("Safari")) setBrowser("Safari");
    else if (ua.includes("Edge")) setBrowser("Edge");
    else setBrowser("Unknown");

    // Fetch IP
    fetch("https://api.ipify.org?format=json")
      .then(res => res.json())
      .then(data => setIpAddress(data.ip))
      .catch(() => setIpAddress("Unknown"));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //  Credentials Sign In
  const onSubmit = async (data) => {
    setLoading(true);
    const response = await callApi({
      method: "POST",
      url: "/auth/sign-in",
      data: {
        ...data,
        deviceInfo: {
          deviceId,
          ip: ipAddress,
          browser,
          os,
          userAgent
        }
      },
    })

    if (response.success) {
      login(response?.data);
      showAlert(response.data?.message, "success");
      navigate(APP_ROUTES.root);
    }
    else {
console.log(response.error)
      setError(response?.error?.message || "An error occurred. Please try again.");
    }

    setLoading(false);
  }


  // todo: Google Sign IN 

  const handleGoogleSignIn = async () => {
  }
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
            <LockOutlined fontSize="small" />
          </Box>

          <Typography fontWeight={600} fontSize={18}>
            Sign in to Trego
          </Typography>

          <Typography variant="caption" color="text.secondary">
            AI-powered project execution
          </Typography>
        </Box>

        {/* Google */}
        <Button
          fullWidth
          variant="outlined"
          size="small"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          sx={{ height: 40, textTransform: "none", fontWeight: 500 }}
        >
          {googleLoading ? <CircularProgress size={18} /> : "Continue with Google"}
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

          <Box display="flex" justifyContent="flex-end" mt={0.5} mb={1.5}>
            <Link
              component={NavLink}
              href="/forgot-password"
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

        {/* Footer */}
        <Box textAlign="center" mt={2}>
          <Typography variant="caption" color="text.secondary">
            New here?{" "}
            <Link
              component={NavLink}
              to={AUTH_ROUTES.signUp}
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

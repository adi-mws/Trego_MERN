import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AUTH_ROUTES, APP_ROUTES } from "../../../lib/routes";
import { useMarketingAuthPrompt } from "../../../contexts/MarketingAuthPromptContext";
import { useDeviceInfo } from "../../../hooks/useDeviceInfo";
import { useGoogleIdentity } from "../../../hooks/useGoogleIdentity";
import useAuth from "../../../hooks/useAuth";
import { callApi } from "../../../api/api";
import { useAlert } from "../../../hooks/useAlert";

export default function MarketingAuthPromptDialog() {
  const navigate = useNavigate();
  const { open, closePrompt } = useMarketingAuthPrompt();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const deviceInfo = useDeviceInfo();
  const { login } = useAuth();
  const showAlert = useAlert();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGoogleCredential = useCallback(async (idToken) => {
    setGoogleBusy(true);
    setGoogleError("");

    try {
      const response = await callApi({
        method: "POST",
        url: "/auth/google",
        data: {
          idToken,
          deviceInfo,
        },
      });

      if (response.success) {
        login(response.data?.data || response.data);
        showAlert(response.data?.message || "Signed in with Google", "success");
        closePrompt();
        navigate(redirect || APP_ROUTES.root);
      } else {
        setGoogleError(response?.error?.message || "Google sign-in failed");
      }
    } finally {
      setGoogleBusy(false);
    }
  }, [closePrompt, deviceInfo, login, navigate, redirect, showAlert]);

  const { promptGoogle, ready: googleReady, error: googleInitError } = useGoogleIdentity({
    clientId,
    onCredential: handleGoogleCredential,
  });

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        closePrompt();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closePrompt, open]);

  const handleGoogleClick = () => {
    const started = promptGoogle();
    if (!started) {
      setGoogleError("Google Sign-In is not ready yet");
    }
  };

  const handleSignIn = () => {
    closePrompt();
    navigate(AUTH_ROUTES.signIn);
  };

  const handleSignUp = () => {
    closePrompt();
    navigate(AUTH_ROUTES.signUp);
  };

  return (
    <Dialog open={open} onClose={closePrompt} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ pb: 1.25 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "16px !important" }} />}
            label="Quick access"
            sx={{ borderRadius: 999, fontWeight: 700 }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography variant="h6" fontWeight={800}>
            Want to keep your work in sync?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to save your progress, get live updates, and keep your devices
            connected. We'll only show this prompt once.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, flexDirection: "column", gap: 1 }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleClick}
          disabled={!googleReady || googleBusy || !deviceInfo.deviceId}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          {googleBusy ? "Signing in..." : "Continue with Google"}
        </Button>

        {(googleError || googleInitError) && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {googleError || googleInitError}
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleSignIn}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Sign in
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={handleSignUp}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Create account
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

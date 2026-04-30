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
import { useNavigate, useSearchParams } from "react-router-dom";
import { AUTH_ROUTES, APP_ROUTES } from "../../../lib/routes";
import { useMarketingAuthPrompt } from "../../../contexts/MarketingAuthPromptContext";
import { useDeviceInfo } from "../../../hooks/useDeviceInfo";
import useAuth from "../../../hooks/useAuth";
import { callApi } from "../../../api/api";
import { useAlert } from "../../../hooks/useAlert";
import { GoogleLogin } from "@react-oauth/google";

export default function MarketingAuthPromptDialog() {
  const navigate = useNavigate();
  const { open, closePrompt } = useMarketingAuthPrompt();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  const deviceInfo = useDeviceInfo();
  const { login } = useAuth();
  const showAlert = useAlert();
  const [googleBusy, setGoogleBusy] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGoogleCredential = useCallback(async (idToken) => {
    if (!idToken) {
      setGoogleError("Google sign-in failed");
      return;
    }

    setGoogleBusy(true);
    setGoogleError("");

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
            sx={{ borderRadius: 999, fontWeight: 500 }}
          />
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
          <Typography variant="h6" fontWeight={500}>
            Want to keep your work in sync?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sign in to save your progress, get live updates, and keep your devices
            connected. We'll only show this prompt once.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, flexDirection: "column", gap: 1 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            pointerEvents: !deviceInfo.deviceId || googleBusy ? "none" : "auto",
            opacity: !deviceInfo.deviceId || googleBusy ? 0.6 : 1,
          }}
        >
          {googleBusy ? (
            <Typography variant="body2" color="text.secondary" py={1}>
              Signing in...
            </Typography>
          ) : (
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                handleGoogleCredential(credentialResponse.credential);
              }}
              onError={() => setGoogleError("Google sign-in failed")}
              width="300"
              text="continue_with"
            />
          )}
        </Box>

        {googleError && (
          <Alert severity="error" sx={{ width: "100%" }}>
            {googleError}
          </Alert>
        )}

        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleSignIn}
            sx={{ textTransform: "none", fontWeight: 400 }}
          >
            Sign in
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={handleSignUp}
            sx={{ textTransform: "none", fontWeight: 400 }}
          >
            Create account
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

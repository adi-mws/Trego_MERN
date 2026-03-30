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
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { Link as NavLink } from "react-router-dom";

export default function SignInForm() {

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  //  Credentials Sign In
  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      callbackUrl
    });


    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

  };

  /* ----------------------------------
     Google Sign In
  -----------------------------------*/
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl });
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
              href="/sign-up"
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

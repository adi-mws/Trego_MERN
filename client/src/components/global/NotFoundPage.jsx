import { Box, Typography, Button, Stack, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, #0f172a, #020617)"
            : "linear-gradient(135deg, #e0f2fe, #f8fafc)",
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          maxWidth: 500,
          width: "100%",
          p: 4,
          borderRadius: 4,
          backdropFilter: "blur(12px)",
          backgroundColor:
            theme.palette.mode === "dark"
              ? "rgba(255,255,255,0.05)"
              : "rgba(255,255,255,0.7)",
          boxShadow: theme.shadows[10],
        }}
      >
        {/* 404 Number */}
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            fontSize: { xs: "4rem", sm: "6rem" },
            lineHeight: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          404
        </Typography>

        {/* Title */}
        <Typography
          variant="h5"
          fontWeight={600}
          mt={1}
          color="text.primary"
        >
          Page Not Found
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          mt={1}
        >
          The page you're looking for doesn’t exist or has been moved.
        </Typography>

        {/* Actions */}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          mt={3}
        >
          <Button
            variant="contained"
            onClick={() => navigate("/")}
          >
            Go Home
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default NotFoundPage;
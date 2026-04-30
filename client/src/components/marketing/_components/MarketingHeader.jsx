import {
  AppBar,
  Box,
  Button,
  Container,
  LinearProgress,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Product Flow", link: "/#product" },
  { label: "How it works", link: "/#how-it-works" },
  { label: "AI Agent", link: "/#agent" },
  { label: "Security", link: "/#security" },
];

export default function MarketingHeader() {
  const navigate = useNavigate();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const doc = document.documentElement;
      const scrollableHeight = doc.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        backdropFilter: "blur(20px)",
        backgroundColor: "rgba(255,255,255,0.82)",
      }}
    >
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{
          backgroundColor: "transparent",
          borderBottom: "1px solid",
          borderColor: "rgba(15,23,42,0.1)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 76 }}>
            <Box
              component="img"
              onClick={() => navigate("/")}
              src="/images/logo-with-text.png"
              alt="Trego"
              sx={{
                width: 90,
                cursor: "pointer",
                display: "block",
              }}
            />

            <Box sx={{ flexGrow: 1 }} />

            <Stack
              direction="row"
              alignItems="center"
              spacing={3}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <Stack direction="row" spacing={3} alignItems="center">
                {NAV_ITEMS.map((item) => (
                  <Typography
                    key={item.label}
                    component="a"
                    href={item.link}
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "rgba(51,65,85,0.78)",
                      textDecoration: "none",
                      transition: "color 160ms ease",
                      "&:hover": {
                        color: "primary.main",
                      },
                    }}
                  >
                    {item.label}
                  </Typography>
                ))}
              </Stack>

              <Stack direction="row" spacing={1.25}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate("/sign-in")}
                  sx={{
                    borderRadius: 999,
                    px: 2.5,
                    fontWeight: 500,
                    bgcolor: "rgba(255,255,255,0.72)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.96)",
                    },
                  }}
                >
                  Sign in
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/sign-up")}
                  sx={{
                    borderRadius: 999,
                    px: 2.8,
                    fontWeight: 500,
                    boxShadow: "0 16px 36px rgba(15,23,42,0.14)",
                  }}
                >
                  Start free
                </Button>
              </Stack>
            </Stack>
          </Toolbar>
        </Container>
        <LinearProgress
          variant="determinate"
          color="primary"
          value={scrollProgress}
          sx={{
            height: 2,
            bgcolor: "rgba(15,23,42,0.06)",
          }}
        />
      </AppBar>
    </Box>
  );
}

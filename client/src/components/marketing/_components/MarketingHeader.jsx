import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import PricingOffer from "./PricingOffer";

const NAV_ITEMS = [
  { label: "Product", link: "/#product" },
  { label: "How it works", link: "/#how-it-works" },
  { label: "Security", link: "/#security" },
  { label: "Pricing", link: "/pricing" },
];

export default function MarketingHeader() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1200,
        backdropFilter: "blur(18px)",
        backgroundColor: "rgba(255,255,255,0.72)",
      }}
    >
      <PricingOffer />

      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{
          backgroundColor: "transparent",
          borderBottom: "1px solid",
          borderColor: "divider",
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
                width: { xs: 92, sm: 112 },
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
                    component={Link}
                    to={item.link}
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: "text.secondary",
                      textDecoration: "none",
                      transition: "color 160ms ease",
                      "&:hover": {
                        color: "text.primary",
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
                  onClick={() => navigate("/sign-in")}
                  sx={{
                    borderRadius: 999,
                    px: 2.5,
                    fontWeight: 400,
                    bgcolor: "rgba(255,255,255,0.8)",
                  }}
                >
                  Sign in
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/sign-up")}
                  sx={{
                    borderRadius: 999,
                    px: 2.8,
                    fontWeight: 400,
                    boxShadow: "0 16px 28px rgba(25,118,210,0.22)",
                  }}
                >
                  Start free
                </Button>
              </Stack>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>
    </Box>
  );
}

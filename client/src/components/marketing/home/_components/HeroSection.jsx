import {
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  Avatar,
} from "@mui/material";

export default function HeroSection() {
  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        overflow: "hidden",
      }}
    >
      <Grid container alignItems="center" spacing={2}>
        {/* LEFT */}
        <Grid size={6} pl={{ md: 10 }}>
          <Stack spacing={4}>

            <Stack direction="row" spacing={1} alignItems="center">
              <Stack direction="row" spacing={-1.5}>
                {[1, 2, 3, 4].map((item) => (
                  <Avatar
                    key={item}
                    sx={{
                      width: 36,
                      height: 36,
                      border: "2px solid",
                      borderColor: "background.paper",
                      bgcolor: "grey.400",
                    }}
                  />
                ))}
              </Stack>

              <Typography variant="body2" color="text.secondary">
                Trusted by <strong>1,000+</strong> teams
              </Typography>
            </Stack>

            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 700,
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
              }}
            >
              Track Your Projects With{" "}
              <Box
                component="span"
                sx={{
                  color: "primary.main",
                  background:
                    "linear-gradient(90deg, #6C5CE7, #00CEC9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AI Agent Powered
              </Box>{" "}
              Workflow
            </Typography>

            {/* 🔥 Description */}
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 520,
                fontSize: 15,
                lineHeight: 1.6,
              }}
            >
              Plan, assign, and optimize tasks automatically.  
              Trego lets AI handle coordination while your team focuses on execution.
            </Typography>

            {/* 🔥 Actions */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Get Started
              </Button>

              <Button
                variant="outlined"
                size="large"
                sx={{
                  fontWeight: 600,
                  px: 3,
                }}
              >
                Explore Product
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {/* RIGHT */}
        <Grid size={6}>
          <Box
            sx={{
              position: "relative",
              height: 400,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 300,
                height: 300,
                borderRadius: "50%",
                background: "radial-gradient(circle, #6C5CE7, transparent)",
                filter: "blur(80px)",
                top: 40,
                right: 60,
                opacity: 0.4,
              }}
            />

            <Box
              component="img"
              src="/images/dashboard-preview/main.png"
              alt="Main Dashboard"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "95%",
                borderRadius: 2,
                boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
              }}
            />

            <Box
              component="img"
              src="/images/dashboard-preview/dash-crop.png"
              alt="Dashboard Detail"
              sx={{
                position: "absolute",
                top: -30,
                right: 40,
                width: "42%",
                borderRadius: 2,
                boxShadow: "0 15px 40px rgba(0,0,0,0.2)",
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
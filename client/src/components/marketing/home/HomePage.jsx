import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DashboardCustomizeOutlinedIcon from "@mui/icons-material/DashboardCustomizeOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { motion, useReducedMotion } from "framer-motion";
import { Link as RouterLink } from "react-router-dom";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const TRUST_LOGOS = ["Product", "Design", "Engineering", "Ops", "Client Success"];

const STATS = [
  { value: "4.9/5", label: "Team satisfaction" },
  { value: "10x", label: "Faster coordination" },
  { value: "87%", label: "Less context switching" },
  { value: "24/7", label: "AI agent coverage" },
];

const FEATURES = [
  {
    icon: <SmartToyOutlinedIcon />,
    title: "Autonomous planning",
    text: "Trego converts project goals into intelligent next steps, ownership, and stage-aware actions.",
  },
  {
    icon: <TimelineOutlinedIcon />,
    title: "Live workflow intelligence",
    text: "Track task movement, blocked states, delays, and stage transitions in one clear operational layer.",
  },
  {
    icon: <Groups2OutlinedIcon />,
    title: "Role-aware collaboration",
    text: "Workspace and project roles shape what the agent can see, suggest, and safely execute.",
  },
  {
    icon: <DashboardCustomizeOutlinedIcon />,
    title: "Command-style control",
    text: "Use a Codex-like interface to search context, inspect payloads, and compose structured prompts.",
  },
  {
    icon: <WorkOutlineOutlinedIcon />,
    title: "Project-native context",
    text: "Project documents, tasks, roles, and comments become first-class context for every answer.",
  },
  {
    icon: <SecurityOutlinedIcon />,
    title: "Permission-safe by design",
    text: "Admin and owner access stays privileged while the rest of the workspace keeps its normal flow.",
  },
];

const STEPS = [
  {
    title: "Connect your workspace",
    text: "Bring in projects, roles, and tasks so the agent understands your actual operating structure.",
  },
  {
    title: "Select context with precision",
    text: "Use lightweight context controls to focus on the right projects, roles, or task clusters.",
  },
  {
    title: "Let the agent assist execution",
    text: "Generate payloads, draft actions, and accelerate decision-making without losing control.",
  },
];

const HERO_VARIANTS = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const STAGGER = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

export default function HomePage() {
  const reduceMotion = useReducedMotion();

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 20% 15%, rgba(25, 118, 210, 0.18), transparent 28%), radial-gradient(circle at 80% 10%, rgba(0, 188, 212, 0.16), transparent 22%), radial-gradient(circle at 70% 78%, rgba(255, 193, 7, 0.16), transparent 26%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.82), transparent 88%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.82), transparent 88%)",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: { xs: 6, md: 8, lg: 10 } }}>
        <MotionBox
          variants={STAGGER}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? false : "show"}
          sx={{ display: "flex", flexDirection: "column", gap: { xs: 9, md: 11 } }}
        >
          <MotionBox
            id="product"
            variants={HERO_VARIANTS}
            transition={{ duration: 0.5, ease: "easeOut" }}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
              gap: { xs: 5, lg: 7 },
              alignItems: "center",
              minHeight: { xs: "auto", lg: "78vh" },
            }}
          >
            <Stack spacing={3.25}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                <Chip
                  icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                  label="Agentic AI powered project management"
                  sx={{
                    bgcolor: "rgba(25,118,210,0.08)",
                    color: "primary.main",
                    fontWeight: 700,
                    borderRadius: 999,
                    px: 0.5,
                  }}
                />
                <Chip
                  label="Built for admins, owners, and high-velocity teams"
                  sx={{
                    bgcolor: "rgba(15,23,42,0.04)",
                    color: "text.secondary",
                    fontWeight: 600,
                    borderRadius: 999,
                  }}
                />
              </Stack>

              <Stack spacing={2.2}>
                <Typography
                  component="h1"
                  variant="h2"
                  sx={{
                    fontWeight: 850,
                    lineHeight: 1.02,
                    letterSpacing: "-0.04em",
                    maxWidth: 820,
                    fontSize: { xs: "3rem", sm: "3.8rem", md: "4.6rem" },
                  }}
                >
                  Agentic AI Powered{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(90deg, #1976d2 0%, #00acc1 42%, #ff8f00 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Project Management
                  </Box>{" "}
                  SaaS
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                    maxWidth: 680,
                    lineHeight: 1.7,
                    fontWeight: 500,
                  }}
                >
                  Trego turns work into a guided system: projects, tasks, roles, workflows, and state history all
                  flow through one agentic workspace that helps teams move faster without losing control.
                </Typography>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/sign-up"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    px: 3,
                    py: 1.4,
                    borderRadius: 999,
                    fontWeight: 800,
                    boxShadow: "0 16px 32px rgba(25,118,210,0.24)",
                  }}
                >
                  Start free
                </Button>
                <Button
                  component={RouterLink}
                  to="/sign-in"
                  variant="outlined"
                  size="large"
                  startIcon={<PlayArrowRoundedIcon />}
                  sx={{
                    px: 3,
                    py: 1.4,
                    borderRadius: 999,
                    fontWeight: 800,
                    borderColor: "divider",
                    bgcolor: "rgba(255,255,255,0.65)",
                    backdropFilter: "blur(14px)",
                  }}
                >
                  Watch demo
                </Button>
              </Stack>

              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                {TRUST_LOGOS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    variant="outlined"
                    sx={{
                      borderRadius: 999,
                      fontWeight: 600,
                      bgcolor: "rgba(255,255,255,0.7)",
                    }}
                  />
                ))}
              </Stack>
            </Stack>

            <MotionBox
              variants={HERO_VARIANTS}
              transition={{ duration: 0.65, ease: "easeOut" }}
              sx={{ position: "relative", minHeight: { xs: 480, md: 620 } }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 24,
                  borderRadius: 8,
                  background:
                    "linear-gradient(180deg, rgba(25,118,210,0.12), rgba(255,255,255,0.92) 40%, rgba(255,255,255,0.78))",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, rgba(25,118,210,0.18), rgba(0,172,193,0.1) 38%, rgba(255,255,255,0.12))",
                  boxShadow: "0 30px 80px rgba(15,23,42,0.12)",
                  border: "1px solid",
                  borderColor: "rgba(255,255,255,0.55)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 220,
                    height: 220,
                    borderRadius: "50%",
                    bgcolor: "rgba(25,118,210,0.22)",
                    filter: "blur(40px)",
                    top: -40,
                    right: -20,
                  }}
                />

                <Box sx={{ position: "relative", p: { xs: 2, sm: 3, md: 4 }, height: "100%" }}>
                  <Stack spacing={2.25} sx={{ height: "100%" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38 }}>
                          <AutoAwesomeOutlinedIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            Trego Command Center
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Live context, payload preview, and execution signals
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip label="Live" color="success" size="small" sx={{ fontWeight: 800, borderRadius: 999 }} />
                    </Stack>

                    <Stack spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 4,
                          bgcolor: "rgba(255,255,255,0.78)",
                          backdropFilter: "blur(16px)",
                          border: "1px solid",
                          borderColor: "rgba(15,23,42,0.06)",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Workspace
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={800}>
                              Sprint Horizon
                            </Typography>
                          </Box>
                          <Chip label="Agent aware" size="small" sx={{ borderRadius: 999 }} />
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                          {["@project", "@frontendDeveloper", "@tasks", "@workflow"].map((item) => (
                            <Chip
                              key={item}
                              label={item}
                              variant="outlined"
                              sx={{ borderRadius: 999, bgcolor: "rgba(255,255,255,0.7)" }}
                            />
                          ))}
                        </Stack>
                      </Paper>

                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ flex: 1, minHeight: 0 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            flex: 1,
                            borderRadius: 4,
                            p: 2,
                            bgcolor: "rgba(255,255,255,0.82)",
                            border: "1px solid",
                            borderColor: "rgba(15,23,42,0.06)",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Chat
                          </Typography>
                          <Typography sx={{ mt: 0.75, fontWeight: 700, lineHeight: 1.65 }}>
                            "Show delayed tasks, project roles, and the next stage transitions."
                          </Typography>
                          <Box
                            sx={{
                              mt: 1.5,
                              p: 1.25,
                              borderRadius: 3,
                              bgcolor: "rgba(25,118,210,0.08)",
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Agent response generated from workspace context and real project documents.
                            </Typography>
                          </Box>
                        </Paper>

                        <Stack spacing={1.25} sx={{ width: { xs: "100%", sm: 220 } }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 4,
                              bgcolor: "rgba(17,24,39,0.96)",
                              color: "common.white",
                              minHeight: 128,
                            }}
                          >
                            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                              Payload preview
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.92)" }}
                            >
{`{
  "contexts": ["project", "tasks", "projectRoles"],
  "mode": "ask",
  "prompt": "Show delayed tasks"
}`}
                            </Typography>
                          </Paper>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2,
                              borderRadius: 4,
                              bgcolor: "rgba(255,255,255,0.82)",
                              border: "1px solid",
                              borderColor: "rgba(15,23,42,0.06)",
                            }}
                          >
                            <Stack direction="row" spacing={1} alignItems="center">
                              <CheckCircleRoundedIcon color="success" fontSize="small" />
                              <Typography variant="body2" fontWeight={700}>
                                Permission-safe
                              </Typography>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              Admin and owner access only.
                            </Typography>
                          </Paper>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </MotionBox>
          </MotionBox>

          <MotionBox variants={HERO_VARIANTS} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              divider={<Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />}
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 5,
                bgcolor: "rgba(255,255,255,0.72)",
                backdropFilter: "blur(20px)",
                border: "1px solid",
                borderColor: "rgba(15,23,42,0.07)",
              }}
            >
              {STATS.map((stat) => (
                <Box key={stat.label} sx={{ flex: 1 }}>
                  <Typography variant="h4" fontWeight={850} sx={{ lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </MotionBox>

          <MotionBox id="how-it-works" variants={HERO_VARIANTS} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Stack spacing={2.25}>
              <Stack spacing={1}>
                <Typography variant="overline" letterSpacing={3} color="text.secondary" fontWeight={800}>
                  Product DNA
                </Typography>
                <Typography variant="h3" fontWeight={850} sx={{ maxWidth: 680, lineHeight: 1.08 }}>
                  A premium surface for teams that want AI, control, and clarity in one place.
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                {FEATURES.map((feature, index) => (
                  <MotionPaper
                    key={feature.title}
                    variants={HERO_VARIANTS}
                    transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.03 }}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 4,
                      height: "100%",
                      bgcolor: "rgba(255,255,255,0.8)",
                      backdropFilter: "blur(14px)",
                      border: "1px solid",
                      borderColor: "rgba(15,23,42,0.06)",
                      transition: "transform 180ms ease, box-shadow 180ms ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 18px 50px rgba(15,23,42,0.08)",
                      },
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 3,
                          display: "grid",
                          placeItems: "center",
                          color: "primary.main",
                          bgcolor: "rgba(25,118,210,0.08)",
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={800}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                        {feature.text}
                      </Typography>
                    </Stack>
                  </MotionPaper>
                ))}
              </Box>
            </Stack>
          </MotionBox>

          <MotionBox id="security" variants={HERO_VARIANTS} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",
                p: { xs: 3, md: 4.5 },
                borderRadius: 6,
                color: "common.white",
                background:
                  "linear-gradient(135deg, rgba(25,118,210,0.08), rgba(0,172,193,0.07) 40%, rgba(255,255,255,0.95))",
                boxShadow: "0 28px 70px rgba(25,118,210,0.12)",
                border: "1px solid",
                borderColor: "rgba(15,23,42,0.06)",
              }}
            >
              <Stack spacing={2.5}>
                <Stack spacing={1}>
                  <Typography variant="overline" letterSpacing={3} color="text.secondary" fontWeight={800}>
                    How it works
                  </Typography>
                  <Typography variant="h4" fontWeight={850} sx={{ maxWidth: 780 }}>
                    From workspace context to agentic execution in three simple moves.
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: 2,
                  }}
                >
                  {STEPS.map((step, index) => (
                    <Box
                      key={step.title}
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        bgcolor: "rgba(255,255,255,0.78)",
                        border: "1px solid",
                        borderColor: "rgba(15,23,42,0.06)",
                      }}
                    >
                      <Stack spacing={1.25}>
                        <Chip
                          label={`0${index + 1}`}
                          size="small"
                          sx={{ width: "fit-content", borderRadius: 999, fontWeight: 800 }}
                        />
                        <Typography variant="h6" fontWeight={800}>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                          {step.text}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Box>
              </Stack>
            </Paper>
          </MotionBox>

          <MotionBox variants={HERO_VARIANTS} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",
                p: { xs: 3, md: 4.5 },
                borderRadius: 6,
                color: "common.white",
                background: "linear-gradient(135deg, #1976d2 0%, #0b5cab 55%, #043661 100%)",
                boxShadow: "0 28px 70px rgba(25,118,210,0.28)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 75% 20%, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.14), transparent 24%)",
                }}
              />
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
                spacing={3}
                sx={{ position: "relative" }}
              >
                <Box sx={{ maxWidth: 680 }}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", letterSpacing: 3 }}>
                    Ready to move faster
                  </Typography>
                  <Typography variant="h3" fontWeight={850} sx={{ mt: 0.75, lineHeight: 1.08 }}>
                    Build your next project system with an agent that understands the work.
                  </Typography>
                  <Typography sx={{ mt: 1.5, color: "rgba(255,255,255,0.82)", lineHeight: 1.75 }}>
                    Launch a workspace where AI assists planning, execution, and reporting without taking away your
                    control.
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
                  <Button
                    component={RouterLink}
                    to="/sign-up"
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{
                      bgcolor: "common.white",
                      color: "primary.main",
                      fontWeight: 850,
                      borderRadius: 999,
                      px: 3,
                      "&:hover": {
                        bgcolor: "rgba(255,255,255,0.94)",
                      },
                    }}
                  >
                    Get started
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/pricing"
                    variant="outlined"
                    size="large"
                    sx={{
                      color: "common.white",
                      borderColor: "rgba(255,255,255,0.4)",
                      fontWeight: 800,
                      borderRadius: 999,
                      px: 3,
                    }}
                  >
                    See pricing
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </MotionBox>
        </MotionBox>
      </Container>
    </Box>
  );
}

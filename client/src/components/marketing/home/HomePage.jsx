import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
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

const CORE_FEATURES = [
  {
    icon: <SmartToyOutlinedIcon />,
    title: "Agentic planning",
    text: "Turn goals into structured work with workspace-aware suggestions, tasks, and follow-up actions.",
  },
  {
    icon: <TimelineOutlinedIcon />,
    title: "Workflow visibility",
    text: "See task movement, stage transitions, blockers, and history in one operational timeline.",
  },
  {
    icon: <Groups2OutlinedIcon />,
    title: "Role-safe collaboration",
    text: "Owners, admins, members, and clients all get the right actions and the right level of access.",
  },
  {
    icon: <DashboardCustomizeOutlinedIcon />,
    title: "Command center search",
    text: "Search projects, roles, tasks, and workflows in a compact command-style experience.",
  },
  {
    icon: <WorkOutlineOutlinedIcon />,
    title: "Workspace-native context",
    text: "Everything the team needs lives inside the workspace, so the agent always has real context.",
  },
  {
    icon: <SecurityOutlinedIcon />,
    title: "Permission aware",
    text: "High-risk actions stay gated while teams still get fast, useful assistance everywhere else.",
  },
];

const DEMO_TABS = [
  {
    label: "Projects",
    title: "Overview and progress at a glance",
    text: "Show live status, completion, and team activity in a layout that looks like the real dashboard.",
    accent: "#1976d2",
    preview: [
      { label: "Total tasks", value: "128" },
      { label: "Completed", value: "96" },
      { label: "Overdue", value: "9" },
    ],
    chips: ["Health score", "Members", "Workflow"],
  },
  {
    label: "Tasks",
    title: "Board, list, and timeline views",
    text: "Highlight execution with a Kanban lane, a table preview, and a timeline strip for scheduled work.",
    accent: "#0ea5e9",
    preview: [
      { label: "Pending", value: "24" },
      { label: "Blocked", value: "5" },
      { label: "Due this week", value: "18" },
    ],
    chips: ["Board", "Tasks", "Timeline"],
  },
  {
    label: "Agent",
    title: "Guided execution from context",
    text: "Demonstrate how the agent pulls from roles, comments, and workflows to produce accurate assistance.",
    accent: "#f59e0b",
    preview: [
      { label: "Context", value: "Workspace + Project" },
      { label: "Mode", value: "Ask / Draft / Execute" },
      { label: "Safety", value: "Role-aware" },
    ],
    chips: ["Context", "Safety", "Payload"],
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
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

function MockDashboard({ accent, chips, preview }) {
  return (
    <Box
      sx={{
        position: "relative",
        p: { xs: 1.5, sm: 2 },
        borderRadius: 5,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "rgba(15,23,42,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,250,252,0.92))",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: "auto -40px -60px auto",
          width: 180,
          height: 180,
          borderRadius: "50%",
          bgcolor: `${accent}22`,
          filter: "blur(26px)",
        }}
      />

      <Stack spacing={1.5} sx={{ position: "relative" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary">
              Dashboard preview
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              Semi-working mockup
            </Typography>
          </Box>
          <Chip
            label="Live"
            size="small"
            sx={{
              borderRadius: 999,
              fontWeight: 500,
              bgcolor: `${accent}14`,
              color: accent,
            }}
          />
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {chips.map((chip) => (
            <Chip
              key={chip}
              label={chip}
              variant="outlined"
              sx={{
                borderRadius: 999,
                fontWeight: 500,
                bgcolor: "rgba(255,255,255,0.7)",
              }}
            />
          ))}
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 1.25,
          }}
        >
          {preview.map((item) => (
            <Paper
              key={item.label}
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 3,
                borderColor: "rgba(15,23,42,0.08)",
                bgcolor: "rgba(255,255,255,0.86)",
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 500, mt: 0.5, lineHeight: 1.1 }}>
                {item.value}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            gap: 1.25,
            minHeight: { xs: 220, md: 260 },
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 4,
              bgcolor: "rgba(17,24,39,0.96)",
              color: "common.white",
              overflow: "hidden",
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.76)", fontWeight: 500 }}>
                  Command stream
                </Typography>
                <Chip
                  label="Preview"
                  size="small"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.12)",
                    color: "white",
                    fontWeight: 500,
                  }}
                />
              </Stack>

              <Box
                sx={{
                  borderRadius: 3,
                  p: 1.5,
                  bgcolor: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                  "Show delayed tasks, role permissions, and the next stage transitions."
                </Typography>
              </Box>

              <Stack spacing={1}>
                {[
                  "Search context is loaded from workspace data.",
                  "Task board and timeline stay in sync.",
                  "Action suggestions respect role permissions.",
                ].map((item) => (
                  <Stack key={item} direction="row" spacing={1} alignItems="center">
                    <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#7CFFB2" }} />
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.78)" }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Paper>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 4,
              bgcolor: "rgba(255,255,255,0.84)",
              borderColor: "rgba(15,23,42,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 1.25,
            }}
          >
            <Box
              sx={{
                flex: 1,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              background: "linear-gradient(180deg, #fff, #f8fafc)",
                p: 1.25,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {[
                { label: "Project", value: "Hospital Management" },
                { label: "View", value: "Board + Timeline" },
                { label: "Status", value: "2 blockers" },
              ].map((row) => (
                <Stack
                  key={row.label}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    px: 1,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {row.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {row.value}
                  </Typography>
                </Stack>
              ))}
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<PlayArrowRoundedIcon />}
              sx={{
                borderRadius: 999,
                fontWeight: 400,
                textTransform: "none",
              }}
            >
              Play dashboard video
            </Button>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export default function HomePage() {
  const reduceMotion = useReducedMotion();
  const [demoTab, setDemoTab] = useState(0);

  const activeDemo = useMemo(() => DEMO_TABS[demoTab] || DEMO_TABS[0], [demoTab]);

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
            "radial-gradient(circle at 14% 16%, rgba(25, 118, 210, 0.16), transparent 26%), radial-gradient(circle at 82% 12%, rgba(14, 165, 233, 0.14), transparent 22%), radial-gradient(circle at 64% 74%, rgba(245, 158, 11, 0.12), transparent 24%)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 88%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent 88%)",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1, py: { xs: 5, md: 8, lg: 10 } }}>
        <MotionBox
          variants={STAGGER}
          initial={reduceMotion ? false : "hidden"}
          animate={reduceMotion ? false : "show"}
          sx={{ display: "flex", flexDirection: "column", gap: { xs: 8, md: 10 } }}
        >
          <MotionBox
            variants={HERO_VARIANTS}
            transition={{ duration: 0.5, ease: "easeOut" }}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.03fr 0.97fr" },
              gap: { xs: 4, lg: 6 },
              alignItems: "center",
              minHeight: { xs: "auto", lg: "76vh" },
            }}
          >
            <Stack spacing={3.25}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                <Chip
                  icon={<AutoAwesomeOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                  label="Agentic project management"
                  sx={{
                    bgcolor: "rgba(25,118,210,0.08)",
                    color: "primary.main",
                    fontWeight: 500,
                    borderRadius: 999,
                  }}
                />
                <Chip
                  label="Built for admins, owners, and high-velocity teams"
                  sx={{
                    bgcolor: "rgba(15,23,42,0.04)",
                    color: "text.secondary",
                    fontWeight: 500,
                    borderRadius: 999,
                  }}
                />
              </Stack>

              <Stack spacing={2.1}>
                <Typography
                  component="h1"
                  variant="h2"
                  sx={{
                    fontWeight: 500,
                    lineHeight: 1.02,
                    letterSpacing: "-0.04em",
                    maxWidth: 860,
                    fontSize: { xs: "2.8rem", sm: "3.55rem", md: "4.35rem" },
                  }}
                >
                  A premium workspace for{" "}
                  <Box
                    component="span"
                    sx={{
                      background: "linear-gradient(90deg, #1976d2 0%, #00acc1 45%, #f59e0b 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    projects, tasks, and AI-assisted execution
                  </Box>
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: "text.secondary",
                    maxWidth: 720,
                    lineHeight: 1.75,
                    fontWeight: 400,
                  }}
                >
                  Trego brings projects, workflows, roles, tasks, and comments into one polished system. Show the
                  board, timeline, and command center as a single product story instead of a collection of screens.
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
                    py: 1.35,
                    borderRadius: 999,
                    fontWeight: 400,
                    boxShadow: "0 16px 32px rgba(25,118,210,0.18)",
                    textTransform: "none",
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
                    py: 1.35,
                    borderRadius: 999,
                    fontWeight: 400,
                    borderColor: "divider",
                    bgcolor: "rgba(255,255,255,0.68)",
                    backdropFilter: "blur(14px)",
                    textTransform: "none",
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
                      fontWeight: 500,
                      bgcolor: "rgba(255,255,255,0.72)",
                    }}
                  />
                ))}
              </Stack>
            </Stack>

            <MotionBox
              variants={HERO_VARIANTS}
              transition={{ duration: 0.65, ease: "easeOut" }}
              sx={{ position: "relative", minHeight: { xs: 520, md: 680 } }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 18,
                  borderRadius: 8,
                  background:
                    "linear-gradient(180deg, rgba(25,118,210,0.10), rgba(255,255,255,0.92) 42%, rgba(255,255,255,0.78))",
                  filter: "blur(0px)",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 8,
                  background:
                    "linear-gradient(135deg, rgba(25,118,210,0.16), rgba(0,172,193,0.08) 38%, rgba(255,255,255,0.12))",
                  boxShadow: "0 30px 80px rgba(15,23,42,0.12)",
                  border: "1px solid",
                  borderColor: "rgba(255,255,255,0.55)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    width: 240,
                    height: 240,
                    borderRadius: "50%",
                    bgcolor: "rgba(25,118,210,0.22)",
                    filter: "blur(44px)",
                    top: -50,
                    right: -30,
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
                          <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                            Trego Command Center
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Live context, payload preview, and execution signals
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label="Live"
                        color="success"
                        size="small"
                        sx={{ fontWeight: 500, borderRadius: 999 }}
                      />
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
                            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                              Sprint Horizon
                            </Typography>
                          </Box>
                          <Chip
                            label="Agent aware"
                            size="small"
                            sx={{ borderRadius: 999, fontWeight: 500 }}
                          />
                        </Stack>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                          {["@project", "@frontendDeveloper", "@tasks", "@workflow"].map((item) => (
                            <Chip
                              key={item}
                              label={item}
                              variant="outlined"
                              sx={{ borderRadius: 999, fontWeight: 500, bgcolor: "rgba(255,255,255,0.7)" }}
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
                          <Typography sx={{ mt: 0.75, fontWeight: 500, lineHeight: 1.7 }}>
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
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
                  <Typography variant="h4" sx={{ fontWeight: 500, lineHeight: 1 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    {stat.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </MotionBox>

          <MotionBox variants={HERO_VARIANTS} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Stack spacing={2.25}>
              <Stack spacing={1}>
                <Typography variant="overline" letterSpacing={3} color="text.secondary" sx={{ fontWeight: 500 }}>
                  Product DNA
                </Typography>
                <Typography variant="h3" sx={{ maxWidth: 720, lineHeight: 1.08, fontWeight: 500 }}>
                  Every feature is presented like part of a polished product story.
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(3, 1fr)" },
                  gap: 2,
                }}
              >
                {CORE_FEATURES.map((feature, index) => (
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
                      <Typography variant="h6" sx={{ fontWeight: 500 }}>
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

          <MotionBox variants={HERO_VARIANTS} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",
                p: { xs: 2.5, md: 4 },
                borderRadius: 6,
                bgcolor: "rgba(255,255,255,0.8)",
                border: "1px solid",
                borderColor: "rgba(15,23,42,0.06)",
              }}
            >
              <Stack spacing={2.5}>
                <Stack spacing={1}>
                  <Typography variant="overline" letterSpacing={3} color="text.secondary" sx={{ fontWeight: 500 }}>
                    Tabbed demo
                  </Typography>
                  <Typography variant="h4" sx={{ maxWidth: 820, fontWeight: 500 }}>
                    Switch between product areas like a lightweight demo browser.
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.75 }}>
                    Use this section for feature-by-feature storytelling and dashboard video slots. Each tab can feel
                    like a self-contained, semi-working mockup.
                  </Typography>
                </Stack>

                <Tabs
                  value={demoTab}
                  onChange={(_, value) => setDemoTab(value)}
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                  sx={{
                    minHeight: 42,
                    "& .MuiTabs-scroller": { overflowX: "auto !important" },
                    "& .MuiTab-root": {
                      minHeight: 42,
                      textTransform: "none",
                      fontWeight: 500,
                    },
                  }}
                >
                  {DEMO_TABS.map((item) => (
                    <Tab key={item.label} label={item.label} />
                  ))}
                </Tabs>

                <MockDashboard
                  accent={activeDemo.accent}
                  chips={activeDemo.chips}
                  preview={activeDemo.preview}
                />
              </Stack>
            </Paper>
          </MotionBox>

          <MotionBox variants={HERO_VARIANTS} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Paper
              elevation={0}
              sx={{
                position: "relative",
                overflow: "hidden",
                p: { xs: 2.5, md: 4 },
                borderRadius: 6,
                background: "linear-gradient(135deg, #1976d2 0%, #0b5cab 55%, #043661 100%)",
                boxShadow: "0 28px 70px rgba(25,118,210,0.22)",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 75% 20%, rgba(255,255,255,0.18), transparent 28%), radial-gradient(circle at 20% 80%, rgba(255,255,255,0.12), transparent 24%)",
                }}
              />
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "flex-start", md: "center" }}
                justifyContent="space-between"
                spacing={3}
                sx={{ position: "relative" }}
              >
                <Box sx={{ maxWidth: 700 }}>
                  <Typography variant="overline" sx={{ color: "rgba(255,255,255,0.72)", letterSpacing: 3, fontWeight: 500 }}>
                    Ready to move faster
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 0.75, lineHeight: 1.08, fontWeight: 500, color: "common.white" }}>
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
                      fontWeight: 400,
                      borderRadius: 999,
                      px: 3,
                      textTransform: "none",
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
                      fontWeight: 400,
                      borderRadius: 999,
                      px: 3,
                      textTransform: "none",
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

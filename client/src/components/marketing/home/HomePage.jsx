import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloudSyncOutlinedIcon from "@mui/icons-material/CloudSyncOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import Groups2OutlinedIcon from "@mui/icons-material/Groups2Outlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import RouteOutlinedIcon from "@mui/icons-material/RouteOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import useMediaQuery from '@mui/material/useMediaQuery';
import { Link as RouterLink } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const page = {
  bg: "#F8FAFC",
  surface: "rgba(255,255,255,0.82)",
  surfaceStrong: "rgba(255,255,255,0.94)",
  border: "rgba(15,23,42,0.12)",
  text: "#0F172A",
  muted: "rgba(51,65,85,0.76)",
  blue: "#2563EB",
  cyan: "#0891B2",
  violet: "#7C3AED",
  green: "#059669",
  amber: "#D97706",
  rose: "#E11D48",
};

const people = [
  {
    name: "Anika",
    role: "Owner",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80",
  },
  {
    name: "Marcus",
    role: "Admin",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=80",
  },
  {
    name: "Priya",
    role: "Member",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=320&q=80",
  },
  {
    name: "Noah",
    role: "Client",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=320&q=80",
  },
];

const stats = [
  ["12K+", "workspaces coordinated"],
  ["2.8M", "tasks processed"],
  ["840K", "AI workflow executions"],
  ["4.7K+", "teams onboarded"],
];

const productFlow = [
  {
    step: "01",
    eyebrow: "Workspace created",
    title: "A workspace becomes the operating room.",
    text: "Owners create the company space, invite admins, members, and clients, then Trego fixes the workspace context for every project, workflow, task, chat, and history that follows.",
    icon: WorkOutlineOutlinedIcon,
    color: page.cyan,
    chips: ["Owner", "Admin", "Members", "Clients"],
    visual: "workspace",
  },
  {
    step: "02",
    eyebrow: "Categories structured",
    title: "Divide the project into clear streams.",
    text: "Instead of a massive backlog, organize work into functional categories. Each category can default to a specific workflow, routing tasks automatically as they are created.",
    icon: AccountTreeOutlinedIcon,
    color: page.blue,
    chips: ["Frontend", "Backend", "Marketing", "Design"],
    visual: "categories",
  },
  {
    step: "03",
    eyebrow: "Workflow built",
    title: "A living workflow replaces loose process.",
    text: "Stages, transitions, allowed roles, and validation rules become a visible path. The workflow is not a static diagram; it controls how task movement really happens.",
    icon: RouteOutlinedIcon,
    color: page.violet,
    chips: ["Intake", "Plan", "Build", "Review", "Launch"],
    visual: "workflow",
  },
  {
    step: "04",
    eyebrow: "Task views",
    title: "Track progress from multiple angles.",
    text: "Switch between Kanban boards for stage progression and Timeline views for daily scheduling. Both views are real-time and bound by the same underlying workflow logic.",
    icon: ViewKanbanOutlinedIcon,
    color: page.amber,
    chips: ["Kanban", "Gantt Timeline", "Real-time sync", "Drag & Drop"],
    visual: "views",
  },
  {
    step: "05",
    eyebrow: "Task assigned",
    title: "Work lands with the right person at the right stage.",
    text: "Members and clients are invited into projects, tasks attach to workflow stages, and assignment rules protect execution from accidental handoffs.",
    icon: TaskAltOutlinedIcon,
    color: page.green,
    chips: ["Task", "Objective", "Role check", "Deadline"],
    visual: "task",
  },
  {
    step: "06",
    eyebrow: "AI chat inspects",
    title: "Reports live in chat, not cluttered dashboards.",
    text: "Clients and teams ask the project assistant for health, blockers, velocity, risks, histories, and next steps. The dashboard stays clean; chat generates the report when needed.",
    icon: ForumOutlinedIcon,
    color: page.rose,
    chips: ["Ask", "Inspect", "Plan", "Project status"],
    visual: "chat",
  },
];

const roleRows = [
  ["Owner", "Full override", 100, page.rose],
  ["Admin", "Workspace/project command", 88, page.amber],
  ["Member", "Stage-based execution", 62, page.green],
  ["Client", "Focused chat inspection", 38, page.cyan],
];

function Reveal({ children, sx }) {
  return (
    <Box className="gsap-reveal" sx={sx}>
      {children}
    </Box>
  );
}

function SectionIntro({ eyebrow, title, text, center = false }) {
  return (
    <Stack
      spacing={1.5}
      alignItems={center ? "center" : "flex-start"}
      textAlign={center ? "center" : "left"}
      sx={{ maxWidth: center ? 920 : 760, mx: center ? "auto" : 0 }}
    >
      <Chip
        label={eyebrow}
        sx={{
          color: page.cyan,
          bgcolor: "rgba(34,211,238,0.1)",
          border: "1px solid rgba(34,211,238,0.24)",
          fontWeight: 500,
        }}
      />
      <Typography
        component="h2"
        sx={{
          color: page.text,
          fontSize: { xs: 34, md: 56 },
          lineHeight: 1.02,
          fontWeight: 500,
          letterSpacing: 0,
        }}
      >
        {title}
      </Typography>
      <Typography sx={{ color: page.muted, fontSize: { xs: 16, md: 19 }, lineHeight: 1.75 }}>
        {text}
      </Typography>
    </Stack>
  );
}

function GlassSurface({ children, sx }) {
  return (
    <Paper
      elevation={0}
      sx={{
        color: page.text,
        bgcolor: page.surface,
        border: `1px solid ${page.border}`,
        borderRadius: 4,
        backdropFilter: "blur(20px)",
        boxShadow: "0 30px 90px rgba(15,23,42,0.12)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function PersonStrip() {
  return (
    <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
      {people.map((person) => (
        <Stack
          key={person.name}
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            p: 0.75,
            pr: 1.25,
            borderRadius: 999,
            bgcolor: "rgba(255,255,255,0.82)",
            border: `1px solid ${page.border}`,
          }}
        >
          <Avatar src={person.image} alt={`${person.name} ${person.role}`} sx={{ width: 34, height: 34 }} />
          <Box>
            <Typography sx={{ color: page.text, fontSize: 13, lineHeight: 1.1 }}>{person.name}</Typography>
            <Typography sx={{ color: page.muted, fontSize: 11, lineHeight: 1.1 }}>{person.role}</Typography>
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

function HeroShowcase() {
  return (
    <Box
      sx={{
        position: "relative",
        perspective: "1400px",
        minHeight: { xs: 500, md: 840 },
      }}
    >
      <Box
        className="gsap-hero-screen"
        // transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        sx={{
        }}
      >
        <Box
          component="img"
          mt={10}
          src="/images/timeline-dashboard.png"
          alt="Trego product dashboard"
          sx={{
            width: "100%",
            height: { xs: 360, md: 520 },
            objectFit: "contain",
            objectPosition: "center",
            borderRadius: 4,
          }}
        />
      </Box>

      <GlassSurface
        className="gsap-float-card"
        sx={{
          position: "absolute",
          left: { xs: 8, md: 0 },
          bottom: { xs: 28, md: 60 },
          width: { xs: "88%", md: 360 },
          p: 2,
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeOutlinedIcon sx={{ color: page.cyan }} />
            <Typography sx={{ fontWeight: 500 }}>AI chat inspection</Typography>
          </Stack>
          <Typography sx={{ color: page.muted, lineHeight: 1.65, fontSize: 14 }}>
            "Inspect project risk, stage delays, and who can approve Launch."
          </Typography>
          <LinearProgress
            variant="determinate"
            value={78}
            sx={{
              height: 7,
              borderRadius: 999,
              bgcolor: "rgba(15,23,42,0.08)",
              "& .MuiLinearProgress-bar": { bgcolor: page.cyan, borderRadius: 999 },
            }}
          />
        </Stack>
      </GlassSurface>

      <GlassSurface
        className="gsap-people-card"
        sx={{
          position: "absolute",
          right: { xs: 8, md: 4 },
          top: { xs: 0, md: 12 },
          width: { xs: 190, md: 250 },
          p: 1.5,
        }}
      >
        <PersonStrip />
      </GlassSurface>
    </Box>
  );
}

function ArtifactVisual({ type, color }) {
  const common = {
    position: "relative",
    minHeight: { xs: 360, md: 480 },
    overflow: "hidden",
  };

  if (type === "workspace") {
    return (
      <Box sx={common}>
        <Box
          component="img"
          src="/images/workspace-overview.png"
          alt="Workspace creation screen"
          sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" }}
        />
      </Box>
    );
  }

  if (type === "categories") {
    return (
      <Box sx={{ ...common, p: 3 }}>
        <Stack spacing={2.5} sx={{ mt: 2 }}>
          {["Frontend Development", "Backend Infrastructure", "Marketing Campaigns", "UI/UX Design"].map((cat, index) => (
            <Box
              key={cat}
              className="gsap-cat-item"
              data-index={index}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.9)",
                border: `1px solid ${page.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 8px 30px rgba(15,23,42,0.04)",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: index === 0 ? page.blue : index === 1 ? page.green : index === 2 ? page.rose : page.amber }} />
                <Typography sx={{ fontWeight: 500, fontSize: 16 }}>{cat}</Typography>
              </Stack>
              <Chip size="small" label={`${(5 - index) * 3} tasks`} sx={{ height: 22, fontSize: 11, fontWeight: 600, bgcolor: "rgba(15,23,42,0.04)" }} />
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  if (type === "workflow") {
    return (
      <Box sx={{ ...common, p: { xs: 2, md: 3 }, perspective: "1200px" }}>
        <Box
          component={"img"}
          src="/images/workflow.png"
          sx={{
            position: "absolute",
            inset: 0,
            objectFit: "fit",

          }}
        />
      </Box>
    );
  }

  if (type === "views") {
    return (
      <Box sx={{ ...common, p: { xs: 2, md: 3 }, perspective: "1000px" }}>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: "linear-gradient(rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <Box
          className="gsap-views-rotate"
          sx={{ position: "relative", height: "100%", transformStyle: "preserve-3d" }}
        >
          {/* Kanban Board Mockup */}
          <Box sx={{ position: "absolute", top: 20, left: 20, right: 20, height: 220, bgcolor: "rgba(255,255,255,0.85)", border: `1px solid ${page.border}`, borderRadius: 4, p: 1.5, display: "flex", gap: 1.5, boxShadow: "0 20px 40px rgba(15,23,42,0.08)", backdropFilter: "blur(10px)" }}>
            {[1, 2].map(col => (
              <Box key={col} sx={{ flex: 1, bgcolor: "rgba(15,23,42,0.03)", borderRadius: 2, p: 1 }}>
                {col == 1 ? <Box component={'img'} src="/images/task-board.png" sx={{ width: '100%' }} />
                  :
                  <>
                    <Box sx={{ width: "50%", height: 6, bgcolor: "rgba(15,23,42,0.15)", borderRadius: 4, mb: 1.5 }} />
                    <Box sx={{ height: 44, bgcolor: "white", borderRadius: 1.5, mb: 1, border: `1px solid ${page.border}` }} />
                    {col === 2 && <Box sx={{ height: 58, bgcolor: "white", borderRadius: 1.5, border: `1px solid ${page.border}` }} />}
                  </>
                }
              </Box>
            ))}
          </Box>
          {/* Timeline Mockup overlaid */}
          <Box sx={{ position: "absolute", top: 180, left: 40, right: -20, height: 180, bgcolor: "rgba(255,255,255,0.96)", border: `1px solid ${page.border}`, borderRadius: 4, p: 2, boxShadow: "0 30px 60px rgba(15,23,42,0.12)", transform: "translateZ(50px)" }}>
            <Box sx={{ display: "flex", gap: 1, mb: 2, borderBottom: `1px solid ${page.border}`, pb: 1 }}>
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <Box key={day} sx={{ flex: 1, height: 12, borderRight: `1px solid ${page.border}` }} />
              ))}
            </Box>
            <Box sx={{ position: "relative", height: 100 }}>
              <Box sx={{ position: "absolute", top: 10, left: "10%", width: "35%", height: 18, bgcolor: `${page.cyan}cc`, borderRadius: 1 }} />
              <Box sx={{ position: "absolute", top: 38, left: "28%", width: "45%", height: 18, bgcolor: `${page.violet}cc`, borderRadius: 1 }} />
              <Box sx={{ position: "absolute", top: 66, left: "55%", width: "30%", height: 18, bgcolor: `${page.amber}cc`, borderRadius: 1 }} />
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  if (type === "task") {
    return (
      <Box sx={{ ...common, p: 3 }}>
        <Stack spacing={2.2}>
          {["Assign owner", "Create objectives", "Set deadline", "Notify admins"].map((item, index) => (
            <Box
              key={item}
              className="gsap-task-item"
              data-index={index}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: "rgba(255,255,255,0.86)",
                border: `1px solid ${page.border}`,
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <CheckCircleRoundedIcon sx={{ color }} />
                <Typography>{item}</Typography>
              </Stack>
            </Box>
          ))}
  
        </Stack>
      </Box>
    );
  }

  if (type === "chat") {
    return (
      <Box sx={{ ...common, p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          {[
            ["Client", "What is the actual project risk right now?"],
            ["Trego AI", "Review is slow, two tasks are near deadline, and Launch needs Owner approval."],
            ["Client", "Create a short recovery plan."],
            ["Trego AI", "Plan: split QA, assign Admin fallback, notify Okwner, then move through Review."],
          ].map(([name, message], index) => (
            <Box
              key={`${name}-${message}`}
              sx={{
                alignSelf: index % 2 ? "flex-start" : "flex-end",
                maxWidth: "82%",
                p: 2,
                borderRadius: 3,
                bgcolor: index % 2 ? "rgba(8,145,178,0.1)" : "rgba(255,255,255,0.9)",
                border: `1px solid ${index % 2 ? "rgba(34,211,238,0.26)" : page.border}`,
              }}
            >
              <Typography sx={{ color: index % 2 ? page.cyan : page.text, fontSize: 13 }}>{name}</Typography>
              <Typography sx={{ color: page.text, mt: 0.75, lineHeight: 1.65 }}>{message}</Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ ...common, p: 3 }}>
      <Stack spacing={2}>
        {roleRows.map(([role, detail, value, tone]) => (
          <Box key={role}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography>{role}</Typography>
              <Typography sx={{ color: tone }}>{detail}</Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={value}
              sx={{
                height: 9,
                borderRadius: 999,
                bgcolor: "rgba(15,23,42,0.08)",
                "& .MuiLinearProgress-bar": { bgcolor: tone, borderRadius: 999 },
              }}
            />
          </Box>
        ))}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 2 }}>
          {["JWT cookie", "Device sessions", "Socket sync", "RBAC"].map((item) => (
            <Chip key={item} label={item} sx={{ color: page.text, bgcolor: "rgba(255,255,255,0.82)" }} />
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

function FlowScene() {
  return (
    <Box className="gsap-flow-container" sx={{ position: "relative", py: { xs: 4, md: 8 } }}>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: { xs: 24, lg: "50%" },
          width: 3,
          bgcolor: "rgba(15,23,42,0.06)",
          transform: { lg: "translateX(-50%)" },
          zIndex: 0,
        }}
      >
        <Box
          className="gsap-timeline-progress"
          sx={{
            width: "100%",
            height: "0%",
            background: `linear-gradient(180deg, ${page.cyan}, ${page.violet}, ${page.rose})`,
            boxShadow: `0 0 15px rgba(34,211,238,0.5)`,
          }}
        />
      </Box>
      <Stack spacing={{ xs: 10, md: 16 }} sx={{ position: "relative", zIndex: 1 }}>
        {productFlow.map((item, index) => {
          const Icon = item.icon;
          const reverse = index % 2 === 1;

          return (
            <Reveal key={item.step}>
              <Box
                className="gsap-flow-step"
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
                  gap: { xs: 4, lg: 14 },
                  alignItems: "center",
                  minHeight: { lg: 500 },
                  position: "relative",
                }}
              >
                <Box
                  className="gsap-flow-dot"
                  sx={{
                    position: "absolute",
                    left: { xs: 24, lg: "50%" },
                    top: { xs: 0, lg: "50%" },
                    transform: { xs: "translate(-50%, -50%)", lg: "translate(-50%, -50%)" },
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    bgcolor: "white",
                    border: `4px solid ${item.color}`,
                    zIndex: 2,
                    boxShadow: "0 0 0 4px rgba(255,255,255,0.8)",
                  }}
                />
                <Stack className="gsap-flow-copy" spacing={2.4} sx={{ order: { xs: 1, lg: reverse ? 2 : 1 }, pl: { xs: 6, lg: 0 } }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        color: item.color,
                        bgcolor: `${item.color}1F`,
                        border: `1px solid ${item.color}55`,
                      }}
                    >
                      <Icon />
                    </Box>
                    <Box>
                      <Typography sx={{ color: item.color, fontSize: 14 }}>{item.step}</Typography>
                      <Typography sx={{ color: page.muted }}>{item.eyebrow}</Typography>
                    </Box>
                  </Stack>
                  <Typography
                    sx={{
                      color: page.text,
                      fontSize: { xs: 34, md: 58 },
                      lineHeight: 1.02,
                      fontWeight: 500,
                      letterSpacing: 0,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: page.muted, fontSize: { xs: 16, md: 19 }, lineHeight: 1.85 }}>
                    {item.text}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {item.chips.map((chip) => (
                      <Chip
                        key={chip}
                        label={chip}
                        sx={{
                          color: page.text,
                          bgcolor: `${item.color}18`,
                          border: `1px solid ${item.color}33`,
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
                <Box
                  className="gsap-flow-artifact"
                  sx={{ order: { xs: 2, lg: reverse ? 1 : 2 }, pl: { xs: 6, lg: 0 } }}
                >
                  <ArtifactVisual type={item.visual} color={item.color} />
                </Box>
              </Box>
            </Reveal>
          );
        })}
      </Stack>
    </Box>
  );
}

function CapabilityRibbon() {
  const capabilities = [
    [ViewKanbanOutlinedIcon, "Kanban boards"],
    [TimelineOutlinedIcon, "Timeline tracking"],
    [RouteOutlinedIcon, "Transition validation"],
    [ManageAccountsOutlinedIcon, "RBAC"],
    [CloudSyncOutlinedIcon, "Realtime updates"],
    [LockOutlinedIcon, "JWT security"],
    [Groups2OutlinedIcon, "Team activity"],
    [BoltOutlinedIcon, "AI task planning"],
  ];

  return (
    <Box
      sx={{
        overflow: "hidden",
        py: 2,
        borderBlock: `1px solid ${page.border}`,
        bgcolor: "rgba(255,255,255,0.62)",
      }}
    >
      <Box
        className="gsap-ribbon-track"
        sx={{ display: "flex", width: "max-content", gap: 1.5 }}
      >
        {[...capabilities, ...capabilities].map(([Icon, label], index) => (
          <Stack
            key={`${label}-${index}`}
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              px: 2,
              py: 1.1,
              borderRadius: 999,
              color: page.text,
              bgcolor: "rgba(255,255,255,0.82)",
              border: `1px solid ${page.border}`,
            }}
          >
            <Box component={Icon} sx={{ fontSize: 18, color: index % 3 === 0 ? page.cyan : index % 3 === 1 ? page.violet : page.green }} />
            <Typography sx={{ whiteSpace: "nowrap", fontSize: 14 }}>{label}</Typography>
          </Stack>
        ))}
      </Box>
    </Box>
  );
}

function Footer() {
  return (
    <Box component="footer" sx={{ borderTop: `1px solid ${page.border}`, py: 4 }}>
      <Container maxWidth="xl">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box component="img" src="/images/logo-with-text.png" alt="Trego" sx={{ width: 104 }} />
            <Typography sx={{ color: page.muted }}>Agentic AI workflow management.</Typography>
          </Stack>
          <Typography sx={{ color: page.muted, fontSize: 14 }}>2026 Trego</Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default function HomePage() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const rootRef = useRef(null);

  useLayoutEffect(() => {
    if (reduceMotion || !rootRef.current) return undefined;

    const context = gsap.context(() => {
      gsap.set(".gsap-hero-kicker, .gsap-hero-title, .gsap-hero-text, .gsap-hero-actions", {
        autoAlpha: 0,
        y: 28,
      });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(".gsap-hero-kicker", { autoAlpha: 1, y: 0, duration: 0.55 })
        .to(".gsap-hero-title", { autoAlpha: 1, y: 0, duration: 0.75 }, "-=0.28")
        .to(".gsap-hero-text", { autoAlpha: 1, y: 0, duration: 0.65 }, "-=0.42")
        .to(".gsap-hero-actions", { autoAlpha: 1, y: 0, duration: 0.55 }, "-=0.34")
        .from(".gsap-hero-screen", { autoAlpha: 0, y: 60, duration: 1.1 }, "-=0.72")
        .from(".gsap-float-card, .gsap-people-card", { autoAlpha: 0, y: 26, scale: 0.94, stagger: 0.12, duration: 0.7 }, "-=0.46");

      gsap.to(".gsap-glow", {
        y: -400,
        x: 100,
        rotate: -20,
        ease: "none",
        scrollTrigger: {
          trigger: ".gsap-page",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      gsap.to(".gsap-hero-screen", {
        // y: -200,/
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".gsap-hero",
          start: "top top",
          end: "top 10%",
          scrub: 1.2,
        },
      });

      gsap.to(".gsap-float-card", {
        y: -80,
        x: 24,
        ease: "none",
        scrollTrigger: {
          trigger: ".gsap-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".gsap-people-card", {
        y: 64,
        x: -28,
        ease: "none",
        scrollTrigger: {
          trigger: ".gsap-hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.2,
        },
      });

      gsap.to(".gsap-ribbon-track", {
        xPercent: -50,
        duration: 24,
        ease: "none",
        repeat: -1,
      });

      gsap.to(".gsap-timeline-progress", {
        height: "100%",
        ease: "none",
        scrollTrigger: {
          trigger: ".gsap-flow-container",
          start: "top center",
          end: "bottom center",
          scrub: 0.5,
        },
      });

      gsap.utils.toArray(".gsap-flow-dot").forEach((dot) => {
        gsap.from(dot, {
          scale: 0,
          autoAlpha: 0,
          scrollTrigger: {
            trigger: dot,
            start: "top center+=100",
            toggleActions: "play none none reverse",
          }
        });
      });

      gsap.utils.toArray(".gsap-flow-step").forEach((step, index) => {
        const copy = step.querySelector(".gsap-flow-copy");
        const artifact = step.querySelector(".gsap-flow-artifact");

        gsap.from(copy, {
          autoAlpha: 0,
          x: index % 2 ? 70 : -70,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: step,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        });

        gsap.fromTo(
          artifact,
          { autoAlpha: 0, y: 60, scale: 0.94 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: step,
              start: "top 76%",
              toggleActions: "play none none reverse",
            },
          }
        );

        gsap.to(artifact, {
          y: index % 2 ? -40 : 40,
          ease: "none",
          scrollTrigger: {
            trigger: step,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      gsap.utils.toArray(".gsap-reveal").forEach((reveal) => {
        gsap.fromTo(reveal, 
          { autoAlpha: 0, y: 28 }, 
          { 
            autoAlpha: 1, 
            y: 0, 
            duration: 0.65, 
            ease: "easeOut",
            scrollTrigger: {
              trigger: reveal,
              start: "top bottom-=100px",
              toggleActions: "play none none none",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray(".gsap-cat-item").forEach((item) => {
        const index = item.dataset.index;
        gsap.fromTo(item, 
          { x: -24, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            delay: index * 0.12,
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              once: true
            }
          }
        );
      });

      gsap.utils.toArray(".gsap-task-item").forEach((item) => {
        const index = item.dataset.index;
        gsap.fromTo(item, 
          { x: 34, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            delay: index * 0.12,
            scrollTrigger: {
              trigger: item,
              start: "top bottom",
              once: true
            }
          }
        );
      });

      gsap.fromTo(".gsap-views-rotate", 
        { rotateY: -5 }, 
        { rotateY: 5, duration: 6, ease: "easeInOut", yoyo: true, repeat: -1 }
      );

      ScrollTrigger.refresh();
    }, rootRef);

    return () => context.revert();
  }, [reduceMotion]);

  return (
    <Box ref={rootRef} className="gsap-page" sx={{ bgcolor: page.bg, color: page.text, overflow: "hidden" }}>
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 18% 8%, rgba(37,99,235,0.14), transparent 30%), radial-gradient(circle at 78% 16%, rgba(124,58,237,0.12), transparent 28%), linear-gradient(180deg, #F8FAFC 0%, #EEF6FF 48%, #F8FAFC 100%)",
        }}
      />
      <Box
        className="gsap-glow"
        sx={{
          position: "fixed",
          inset: "10% -10% auto -10%",
          height: 520,
          pointerEvents: "none",
          background:
            "linear-gradient(110deg, rgba(8,145,178,0.12), rgba(124,58,237,0.12), rgba(225,29,72,0.08))",
          filter: "blur(76px)",
          transform: "rotate(-8deg)",
        }}
      />

      <Box className="gsap-hero" component="section" sx={{ position: "relative", minHeight: { xs: "auto", lg: "calc(100vh - 78px)" }, py: { xs: 5, md: 8 } }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              flexDirection: 'column',
              alignItems: "center",
              maxWidth: 900,
              alignSelf: 'center',
              justifySelf: 'center'
            }}
          >
            <Stack spacing={3.2} alignItems={'center'} justifyContent={'center'}>
              <Stack className="gsap-hero-kicker" direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<AutoAwesomeOutlinedIcon sx={{ color: `${page.cyan} !important` }} />}
                  label="Agentic AI workflow platform"
                  sx={{ color: page.cyan, bgcolor: "rgba(8,145,178,0.1)", border: "1px solid rgba(8,145,178,0.24)" }}
                />
                <Chip
                  label="Final-project grade SaaS experience"
                  sx={{ color: page.text, bgcolor: "rgba(255,255,255,0.86)", display: { xs: 'none', sm: "flex" }, border: `1px solid ${page.border}` }}
                />
              </Stack>
              <Typography
                className="gsap-hero-title"
                component="h1"
                sx={{
                  color: page.text,
                  textAlign: 'center',
                  fontSize: { xs: 38, sm: 48, md: 68 },
                  lineHeight: 0.94,
                  fontWeight: 500,
                  letterSpacing: 0,
                }}
              >
                Watch a workspace turn into an AI-run delivery system.
              </Typography>
              <Typography className="gsap-hero-text"
                sx={{
                  color: page.muted,
                  textAlign: "center",
                  fontSize: { xs: 17 },
                }}>
                Trego is not just a list of features. It is a flow: create the workspace, build the workflow, assign
                tasks, inspect with AI chat, and keep every move secure in realtime.
              </Typography>
              <Stack className="gsap-hero-actions" justifyContent={{ xs: 'center' }} width={{ xs: '100%', sm: 'auto' }} direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <Button
                  component={RouterLink}
                  to="/sign-up"
                  variant="contained"
                  color="primary"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    py: 1.35,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Start building
                </Button>
                <Button
                  href="#flow"
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    py: 1.35,
                    textTransform: "none",
                    fontWeight: 500,
                    bgcolor: "rgba(255,255,255,0.78)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.96)" },
                  }}
                >
                  See the flow
                </Button>
              </Stack>
            </Stack>
            <HeroShowcase />
          </Box>
        </Container>
      </Box>

      <Box sx={{ position: "relative" }}>
        <CapabilityRibbon />

        <Container maxWidth="xl" sx={{ py: { xs: 7, md: 12 } }}>
          <Stack spacing={{ xs: 8, md: 13 }}>

            <Reveal sx={{ scrollMarginTop: 100 }}>
              <Box component="section" id="product">
                <SectionIntro
                  eyebrow="Product flow"
                  title="No generic feature grid. This is the workflow story."
                  text="Each layer locks into the next one. Workspace context powers projects. Projects power workflows. Workflows control tasks. AI chat reads the whole system."
                  center
                />
              </Box>
            </Reveal>

            <Box component="section" id="flow" sx={{ scrollMarginTop: 100 }}>
              <FlowScene />
            </Box>

            <Reveal sx={{ scrollMarginTop: 100 }}>
              <Box component="section" id="how-it-works">
                <SectionIntro
                  eyebrow="Layered product journey"
                  title="The page moves like a product demo, not a feature list."
                  text="Each scroll step reveals the next part of Trego: workspace context, workflow design, task ownership, client-facing AI chat, and secure project execution."
                  center
                />
              </Box>
            </Reveal>

            <Reveal sx={{ scrollMarginTop: 100 }}>
              <Box component="section" id="agent">
                <GlassSurface sx={{ p: { xs: 2.5, md: 5 } }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "0.9fr 1.1fr" }, gap: 4, alignItems: "center" }}>
                    <SectionIntro
                      eyebrow="AI chat only"
                      title="Health reports are generated inside chat, exactly where clients ask."
                      text="The dashboard stays focused on work. The AI assistant handles reports, inspection, recovery planning, blockers, and project answers through conversation."
                    />
                    <ArtifactVisual type="chat" color={page.amber} />
                  </Box>
                </GlassSurface>
              </Box>
            </Reveal>

            <Reveal sx={{ scrollMarginTop: 100 }}>
              <Box component="section" id="security">
                <GlassSurface sx={{ p: { xs: 2.5, md: 5 } }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 4, alignItems: "center" }}>
                    <SectionIntro
                      eyebrow="Secure realtime SaaS"
                      title="The beautiful flow is still protected by real backend rules."
                      text="JWT HTTP-only cookies, device sessions, Socket.IO updates, and server-side role checks keep Trego believable as a serious MERN SaaS platform."
                    />
                    <ArtifactVisual type="secure" color={page.rose} />
                  </Box>
                </GlassSurface>
              </Box>
            </Reveal>

            <Reveal>
              <Box
                component="section"
                sx={{
                  borderRadius: 5,
                  p: { xs: 3, md: 6 },
                  overflow: "hidden",
                  border: `1px solid ${page.border}`,
                  background:
                    "linear-gradient(135deg, rgba(96,165,250,0.2), rgba(34,211,238,0.12) 40%, rgba(167,139,250,0.18))",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={3}
                >
                  <Box sx={{ maxWidth: 780 }}>
                    <Typography
                      sx={{
                        color: page.text,
                        fontSize: { xs: 34, md: 58 },
                        lineHeight: 1.04,
                        fontWeight: 500,
                      }}
                    >
                      Build workflows that actually feel production-ready.
                    </Typography>

                    <Typography
                      sx={{
                        color: page.muted,
                        mt: 2,
                        fontSize: 18,
                        lineHeight: 1.8,
                        maxWidth: 680,
                      }}
                    >
                      From workspaces and project roles to AI-assisted workflows, task
                      transitions, notifications, and analytics — Trego delivers the structure
                      of a real enterprise collaboration platform.
                    </Typography>

                    <Box
                      sx={{
                        mt: 4,
                        display: "flex",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                      endIcon={<ArrowForwardRoundedIcon />}
                        component={RouterLink}
                        to="/sign-up"
                        variant="contained"
                        size="large"
                        sx={{
                          px: 3.5,
                          py: 1.3,
                          borderRadius: "14px",
                        }}
                      >
                        Explore The Platform
                      </Button>
                    </Box>
                  </Box>
              
                </Stack>
              </Box>
            </Reveal>
          </Stack>
        </Container>

        <Footer />
      </Box>
    </Box >
  );
}

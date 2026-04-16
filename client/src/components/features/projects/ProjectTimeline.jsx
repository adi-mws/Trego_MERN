import React, { useMemo, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType
} from "reactflow";
import "reactflow/dist/style.css";
import { Card, Typography, Chip, Box, Tabs, Tab, useTheme } from "@mui/material";
// DATA
const tasks = [
  { id: "1", label: "Project Setup", category: "Backend", stage: "DONE", deps: [] },
  { id: "2", label: "UI Wireframes", category: "Frontend", stage: "DONE", deps: [] },
  { id: "3", label: "Test Plan", category: "Testing", stage: "DONE", deps: [] },
  { id: "4", label: "DevOps Setup", category: "DevOps", stage: "DONE", deps: [] },

  { id: "5", label: "DB Schema", category: "Backend", stage: "DONE", deps: ["1"] },
  { id: "6", label: "Auth API", category: "Backend", stage: "IN_PROGRESS", deps: ["5"] },
  { id: "7", label: "Booking API", category: "Backend", stage: "TODO", deps: ["5"] },
  { id: "8", label: "Payment API", category: "Backend", stage: "TODO", deps: ["6", "7"] },

  { id: "9", label: "Login UI", category: "Frontend", stage: "DONE", deps: ["2"] },
  { id: "10", label: "Dashboard UI", category: "Frontend", stage: "IN_PROGRESS", deps: ["2"] },
  { id: "11", label: "Booking UI", category: "Frontend", stage: "TODO", deps: ["10"] },
  { id: "12", label: "Payment UI", category: "Frontend", stage: "TODO", deps: ["11", "8"] },

  { id: "13", label: "Unit Tests", category: "Testing", stage: "TODO", deps: ["6"] },
  { id: "14", label: "Integration Tests", category: "Testing", stage: "TODO", deps: ["7", "8"] },
  { id: "15", label: "UI Testing", category: "Testing", stage: "TODO", deps: ["9", "11"] },
  { id: "16", label: "E2E Testing", category: "Testing", stage: "TODO", deps: ["12", "14", "15"] },

  { id: "17", label: "CI Pipeline", category: "DevOps", stage: "DONE", deps: ["4"] },
  { id: "18", label: "CD Setup", category: "DevOps", stage: "IN_PROGRESS", deps: ["17"] },
  { id: "19", label: "Monitoring", category: "DevOps", stage: "TODO", deps: ["18"] },
  { id: "20", label: "Deploy", category: "DevOps", stage: "TODO", deps: ["16", "19"] },
];

// Stage config
const getStageMeta = (stage) => {
  if (stage === "DONE") return { color: "#2e7d32", progress: 100 };
  if (stage === "IN_PROGRESS") return { color: "#1976d2", progress: 50 };
  return { color: "#9e9e9e", progress: 0 };
};

// NODE COMPONENT
import { Handle, Position } from "reactflow";

const TaskNode = ({ data }) => {
  const { color, progress } = getStageMeta(data.stage);
  const [openPopover, setOpenPopover] = useState(false);
  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 170,
        p: 1.2,
        position: "relative",
        borderLeft: `3px solid ${color}`,
      }}
    >
      {/* LEFT HANDLE (incoming) */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 8, height: 8 }}
      />

      {/* RIGHT HANDLE (outgoing) */}
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 8, height: 8 }}
      />

      {/* Progress overlay */}
      {progress > 0 && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            width: `${progress}%`,
            background: `${color}20`,
          }}
        />
      )}

      <Box sx={{ position: "relative" }}>
        <Typography fontSize={12} fontWeight={600}>
          {data.label}
        </Typography>

        <Chip size="small" label={data.stage} sx={{ mt: 1 }} />
      </Box>
    </Card>
  );
};

// GRAPH BUILDER
const buildGraph = () => {
  const map = Object.fromEntries(tasks.map((t) => [t.id, t]));

  const getLevel = (task) => {
    if (!task.deps.length) return 0;
    return Math.max(...task.deps.map((d) => getLevel(map[d]))) + 1;
  };

  const categories = ["Backend", "Frontend", "Testing", "DevOps"];

  const nodes = tasks.map((task) => {
    const level = getLevel(task);
    const row = categories.indexOf(task.category);

    return {
      id: task.id,
      type: "taskNode",
      position: {
        x: level * 260,
        y: row * 150,
      },
      data: task,
    };
  });
  const theme = useTheme();

  const edges = [];

  tasks.forEach((task) => {
    task.deps.forEach((dep) => {
      edges.push({
        id: `${dep}-${task.id}`,
        source: dep,
        target: task.id,

        type: "bezier", // smoother

        sourceHandle: null, // optional but clean
        targetHandle: null,

        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: theme.palette.primary.main,
        },

        style: {
          stroke: theme.palette.primary.main,
          strokeWidth: 1.5,
        },
      });
    });
  });

  return { nodes, edges };
};

export default function ProjectTimeline() {
  const { nodes, edges } = useMemo(() => buildGraph(), []);
  const [tab, setTab] = useState(0);

  const handleTabChange = () => {
    if (tab === 0) setTab(1);
    else setTab(0);
  }

  return (
    <Box sx={{ height: '75dvh' }}>
      <Tabs onChange={handleTabChange} sx={{ background: 'white' }} variant="outlined">
        {["Task Categories", "Task"].map((item, index) => {
          return (< Tab
            sx={{
              textTransform: "none",
              ml: 1,
              fontSize: 13,
              minHeight: "auto",
              px: 2,
              py: 0.75,
              borderRadius: 2,
              bgcolor: tab === index ? "background.paper" : "transparent",
              border: "1px solid",
              borderColor: tab === index ? "transparent" : "primary.main",
              color: tab === index ? 'text.primary' : 'primary.main',
              "&:hover": {
                bgcolor: "action.hover",
              },
            }} label={item} />
          )
        })}
      </Tabs>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ taskNode: TaskNode }}
        fitView
      >

        {/* EDGE GLOW */}
        <defs>
          <filter id="edge-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <MiniMap style={{ opacity: 0.4 }} />
        <Controls />
        <Background gap={20} size={1} />
      </ReactFlow>
    </Box>
  );
}
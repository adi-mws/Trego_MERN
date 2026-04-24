import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box, Typography, Stack, Chip, Tooltip, IconButton,
  CircularProgress, Button, Paper, Avatar, Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlagIcon from "@mui/icons-material/Flag";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { callApi } from "../../../api/api";
import CreateTaskDialog from "../tasks/_components/CreateTaskDialog";
import BlockTaskDialog from "../tasks/_components/BlockTaskDialog";
import { PROJECT_ROUTES } from "../../../lib/routes";

const PRIORITY_COLOR = { LOW: "#52c41a", MEDIUM: "#faad14", HIGH: "#f5222d" };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getDaysBetween(start, end) {
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

function getOffsetDays(base, date) {
  return Math.floor((date - base) / (1000 * 60 * 60 * 24));
}

// ─── Timeline Row ──────────────────────────────────────────────────────────────
function TimelineRow({ task, minDate, totalDays, dayWidth, onBlock, onOpen }) {
  const hasRange = task.startDate || task.deadline;

  const start = task.startDate ? new Date(task.startDate) : (task.deadline ? new Date(task.deadline) : null);
  const end = task.deadline ? new Date(task.deadline) : (task.startDate ? new Date(task.startDate) : null);

  const leftDays = start ? Math.max(0, getOffsetDays(minDate, start)) : null;
  const spanDays = start && end ? Math.max(1, getDaysBetween(start, end)) : 1;

  const barLeft = leftDays !== null ? leftDays * dayWidth : null;
  const barWidth = spanDays * dayWidth;

  const barColor = task.color || "#1890ff";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        height: 40,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&:hover": { bgcolor: "action.hover" },
        opacity: task.isBlocked ? 0.65 : 1,
      }}
    >
      {/* Task label — fixed left column */}
      <Box
        sx={{
          minWidth: 200,
          maxWidth: 200,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderRight: "1px solid",
          borderColor: "divider",
          height: "100%",
        }}
      >
        {task.isBlocked && <BlockIcon sx={{ fontSize: 14, color: "error.main", flexShrink: 0 }} />}
        <Tooltip title={`${task.title} — click to open`}>
          <Typography
            variant="caption"
            fontWeight={600}
            noWrap
            onClick={() => onOpen(task)}
            sx={{ color: task.isBlocked ? "text.disabled" : "text.primary", cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
          >
            {task.title}
          </Typography>
        </Tooltip>
        <Box sx={{ ml: "auto", width: 8, height: 8, borderRadius: "50%", bgcolor: PRIORITY_COLOR[task.priority], flexShrink: 0 }} />
      </Box>

      {/* Gantt area */}
      <Box sx={{ flex: 1, position: "relative", height: "100%", overflow: "hidden" }}>
        {barLeft !== null ? (
          <Tooltip title={`${task.title}${task.isBlocked ? ` — Blocked: ${task.blockedReason}` : ""}`}>
            <Box
              sx={{
                position: "absolute",
                left: barLeft,
                top: "50%",
                transform: "translateY(-50%)",
                height: 20,
                width: Math.max(barWidth, 24),
                borderRadius: 10,
                bgcolor: `${barColor}cc`,
                border: `1.5px solid ${barColor}`,
                cursor: "pointer",
                transition: "filter 0.15s",
                "&:hover": { filter: "brightness(1.15)" },
              }}
              onClick={() => onOpen(task)}
            />
          </Tooltip>
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)" }}>
            No date
          </Typography>
        )}
      </Box>

      {/* Block action */}
      <Tooltip title={task.isBlocked ? "Unblock" : "Block"}>
        <IconButton size="small" onClick={() => onBlock(task)} sx={{ mr: 0.5 }}>
          {task.isBlocked
            ? <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
            : <BlockIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

// ─── Category Group ────────────────────────────────────────────────────────────
function CategoryGroup({ label, color, tasks, minDate, totalDays, dayWidth, onBlock, onAddTask, onOpen }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Box>
      {/* Group Header */}
      <Box
        onClick={() => setCollapsed(c => !c)}
        sx={{
          display: "flex",
          alignItems: "center",
          height: 36,
          px: 1.5,
          bgcolor: color ? `${color}18` : "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          userSelect: "none",
          gap: 1,
        }}
      >
        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color || "#999", flexShrink: 0 }} />
        <Typography variant="caption" fontWeight={700} color={color || "text.primary"}>
          {label}
        </Typography>
        <Chip size="small" label={tasks.length} sx={{ height: 18, fontSize: 10 }} />
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Add task to this category">
          <IconButton
            size="small"
            onClick={e => { e.stopPropagation(); onAddTask(); }}
            sx={{ p: 0.3 }}
          >
            <AddIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Typography variant="caption" color="text.secondary">{collapsed ? "▶" : "▼"}</Typography>
      </Box>

      {/* Rows */}
      {!collapsed && tasks.map(t => (
        <TimelineRow
          key={t._id}
          task={t}
          minDate={minDate}
          totalDays={totalDays}
          dayWidth={dayWidth}
          onBlock={onBlock}
          onOpen={onOpen}
        />
      ))}
    </Box>
  );
}

// ─── Main Timeline / Gantt Chart ──────────────────────────────────────────────
export default function ProjectTimeline() {
  const { _id: projectId } = useSelector(s => s.project);
  const { workspaceSlug, projectSlug } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategoryId, setCreateCategoryId] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);

  const DAY_WIDTH = 28;
  const headerRef = useRef();
  const bodyRef = useRef();

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const [taskRes, catRes] = await Promise.all([
      callApi({ method: "get", url: `/tasks/project/${projectId}` }),
      callApi({ method: "get", url: `/tasks/project/${projectId}/categories` }),
    ]);
    if (taskRes.success) setTasks(taskRes.data.data);
    if (catRes.success) setCategories(catRes.data.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sync scroll of header and body horizontally
  const syncScroll = (from, to) => {
    if (to.current) to.current.scrollLeft = from.scrollLeft;
  };

  // ── Date range across all tasks ────────────────────────────────────────────
  const dates = tasks
    .flatMap(t => [t.startDate, t.deadline].filter(Boolean).map(d => new Date(d)))
    .filter(d => !isNaN(d));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDate = dates.length ? new Date(Math.min(...dates, today)) : today;
  const maxDate = dates.length ? new Date(Math.max(...dates, today)) : new Date(today.getTime() + 30 * 86400000);

  // Extend ±7 days for padding
  minDate.setDate(minDate.getDate() - 7);
  maxDate.setDate(maxDate.getDate() + 14);

  const totalDays = getDaysBetween(minDate, maxDate);

  // Build month header segments
  const monthSegments = [];
  let cur = new Date(minDate);
  while (cur < maxDate) {
    const month = cur.getMonth();
    const year = cur.getFullYear();
    let count = 0;
    while (cur < maxDate && cur.getMonth() === month) {
      cur = new Date(cur.getTime() + 86400000);
      count++;
    }
    monthSegments.push({ label: `${MONTHS[month]} ${year}`, days: count });
  }

  // Today marker offset
  const todayOffset = getOffsetDays(minDate, today) * DAY_WIDTH;

  // ── Group tasks by category ────────────────────────────────────────────────
  const catMap = {};
  categories.forEach(c => { catMap[c._id] = c; });

  const grouped = {};
  const uncategorized = [];

  tasks.forEach(t => {
    if (!t.categoryId) { uncategorized.push(t); return; }
    const cid = String(t.categoryId);
    if (!grouped[cid]) grouped[cid] = [];
    grouped[cid].push(t);
  });

  const handleBlocked = updated => {
    setTasks(ts => ts.map(t => t._id === updated._id ? { ...t, ...updated } : t));
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  );

  const ganttWidth = totalDays * DAY_WIDTH;

  const handleOpen = (task) => navigate(PROJECT_ROUTES.projectTaskDetail(workspaceSlug, projectSlug, task._id));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* ── Top bar ── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >

        <Box>
          <Typography variant="h5" fontWeight={700}>Gantt Chart</Typography>
          <Typography variant="caption" color="text.secondary" display="block">Gantt Timeline — {tasks.length} tasks across {categories.length} categories</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCreateCategoryId(null); setCreateOpen(true); }} sx={{ borderRadius: 2 }}>
          New Task
        </Button>
      </Box>

      {/* ── Header row (months + days) ── */}
      <Box sx={{ display: "flex", flexShrink: 0, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
        {/* Fixed corner */}
        <Box sx={{ minWidth: 200, borderRight: "1px solid", borderColor: "divider", px: 1.5, display: "flex", alignItems: "center" }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">TASK</Typography>
        </Box>
        {/* Scrollable month header */}
        <Box
          ref={headerRef}
          sx={{ flex: 1, overflowX: "hidden", display: "flex", flexDirection: "column" }}
          onScroll={e => syncScroll(e.target, bodyRef)}
        >
          {/* Month row */}
          <Box sx={{ display: "flex", height: 24, bgcolor: "background.default" }}>
            {monthSegments.map((seg, i) => (
              <Box
                key={i}
                sx={{
                  minWidth: seg.days * DAY_WIDTH,
                  width: seg.days * DAY_WIDTH,
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  borderRight: "1px solid",
                  borderColor: "divider",
                  flexShrink: 0,
                }}
              >
                <Typography variant="caption" fontWeight={700} noWrap>{seg.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* Day numbers row */}
          <Box sx={{ display: "flex", height: 22 }}>
            {Array.from({ length: totalDays }).map((_, i) => {
              const d = new Date(minDate.getTime() + i * 86400000);
              const isToday = getOffsetDays(minDate, today) === i;
              return (
                <Box
                  key={i}
                  sx={{
                    minWidth: DAY_WIDTH,
                    width: DAY_WIDTH,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRight: "1px solid",
                    borderColor: "divider",
                    flexShrink: 0,
                    bgcolor: isToday ? "primary.main" : "transparent",
                    borderRadius: isToday ? 1 : 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontSize={9}
                    sx={{ color: isToday ? "#fff" : d.getDay() === 0 || d.getDay() === 6 ? "text.disabled" : "text.secondary" }}
                  >
                    {d.getDate()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
        {/* action column space */}
        <Box sx={{ minWidth: 36 }} />
      </Box>

      {/* ── Body ── */}
      <Box sx={{ flex: 1, overflowY: "auto", display: "flex" }}>
        {/* Fixed label column */}
        <Box sx={{ minWidth: 200, borderRight: "1px solid", borderColor: "divider", flexShrink: 0 }} />

        {/* Scrollable gantt area */}
        <Box
          ref={bodyRef}
          sx={{ flex: 1, overflowX: "auto", position: "relative" }}
          onScroll={e => syncScroll(e.target, headerRef)}
        >
          {/* Today line */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: todayOffset,
              bottom: 0,
              width: 2,
              bgcolor: "primary.main",
              opacity: 0.5,
              zIndex: 1,
              pointerEvents: "none",
            }}
          />

          {/* Category groups */}
          {categories.map(cat => {
            const catTasks = grouped[cat._id] || [];
            if (catTasks.length === 0) return null;
            return (
              <CategoryGroup
                key={cat._id}
                label={cat.name}
                color={cat.color}
                tasks={catTasks}
                minDate={minDate}
                totalDays={totalDays}
                dayWidth={DAY_WIDTH}
                onBlock={setBlockTarget}
                onOpen={handleOpen}
                onAddTask={() => { setCreateCategoryId(cat._id); setCreateOpen(true); }}
              />
            );
          })}

          {/* Uncategorized */}
          {uncategorized.length > 0 && (
            <CategoryGroup
              label="Uncategorized"
              color={null}
              tasks={uncategorized}
              minDate={minDate}
              totalDays={totalDays}
              dayWidth={DAY_WIDTH}
              onBlock={setBlockTarget}
              onOpen={handleOpen}
              onAddTask={() => { setCreateCategoryId(null); setCreateOpen(true); }}
            />
          )}

          {tasks.length === 0 && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200 }}>
              <Typography color="text.secondary">No tasks yet. Create one to see the timeline.</Typography>
            </Box>
          )}
        </Box>
        {/* action space */}
        <Box sx={{ minWidth: 36, flexShrink: 0 }} />
      </Box>

      <CreateTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchData()}
        defaultCategoryId={createCategoryId}
      />
      {blockTarget && (
        <BlockTaskDialog
          open={!!blockTarget}
          task={blockTarget}
          onClose={() => setBlockTarget(null)}
          onBlocked={handleBlocked}
        />
      )}
    </Box>
  );
}
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  Box, Typography, Stack, Chip, Tooltip, IconButton,
  CircularProgress, Button, Alert
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import TodayIcon from "@mui/icons-material/Today";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { callApi } from "../../../api/api";
import CreateTaskDialog from "../tasks/_components/CreateTaskDialog";
import BlockTaskDialog from "../tasks/_components/BlockTaskDialog";
import { PROJECT_ROUTES } from "../../../lib/routes";
import { resolveWorkspaceRole } from "../../../utils/workspaceRole.utils";
import { isAdmin, canCreateProjectTask } from "../../../utils/permissions.utils";

const PRIORITY_COLOR = { LOW: "#52c41a", MEDIUM: "#faad14", HIGH: "#f5222d" };
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_WIDTH = 48; 

function getDaysBetween(start, end) {
  return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

function getOffsetDays(base, date) {
  return (date - base) / (1000 * 60 * 60 * 24);
}

function TimelineRow({ task, minDate, dayWidth, onBlock, onOpen, onEdit }) {
  const start = task.startDate ? new Date(task.startDate) : (task.deadline ? new Date(task.deadline) : null);
  const end = task.deadline ? new Date(task.deadline) : (task.startDate ? new Date(task.startDate) : null);

  // Use fractional offset for exact bar positioning
  const leftDays = start ? Math.max(0, getOffsetDays(minDate, start)) : null;
  const spanDays = start && end ? Math.max(1, getOffsetDays(start, end) || 1) : 1;

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
        width: "fit-content",
        minWidth: "100%",
      }}
    >
      <Box
        sx={{
          minWidth: 240,
          maxWidth: 240,
          px: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderRight: "1px solid",
          borderColor: "divider",
          height: "100%",
          position: "sticky",
          left: 0,
          bgcolor: "background.paper",
          zIndex: 2,
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
      <Box sx={{ flex: 1, position: "relative", height: "100%", minWidth: "calc(100% - 240px)" }}>
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
      <Box sx={{ position: "sticky", right: 0, bgcolor: "background.paper", borderLeft: "1px solid", borderColor: "divider", px: 0.5, zIndex: 2, height: "100%", display: "flex", alignItems: "center" }}>
        <Tooltip title="Edit task">
          <IconButton size="small" onClick={() => onEdit(task)}>
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={task.isBlocked ? "Unblock" : "Block"}>
          <IconButton size="small" onClick={() => onBlock(task)}>
            {task.isBlocked
              ? <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />
              : <BlockIcon sx={{ fontSize: 16, color: "text.disabled" }} />}
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function CategoryGroup({ label, color, tasks, minDate, dayWidth, onBlock, onAddTask, onOpen, onEdit, canCreateTask }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Box sx={{ width: "fit-content", minWidth: "100%" }}>
      {/* Group Header */}
      <Box
        onClick={() => setCollapsed(c => !c)}
        sx={{
          display: "flex",
          alignItems: "center",
          height: 36,
          bgcolor: color ? `${color}18` : "action.hover",
          borderBottom: "1px solid",
          borderColor: "divider",
          cursor: "pointer",
          userSelect: "none",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "sticky",
            left: 0,
            height: "100%",
            px: 1.5,
            minWidth: 240,
            maxWidth: 240,
            bgcolor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
            zIndex: 4,
          }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color || "#999", flexShrink: 0 }} />
          <Typography variant="caption" fontWeight={700} color={color || "text.primary"} noWrap>
            {label}
          </Typography>
          <Chip size="small" label={tasks.length} sx={{ height: 18, fontSize: 10, ml: "auto" }} />
        </Box>

        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            position: "sticky",
            right: 0,
            height: "100%",
            px: 1.5,
            zIndex: 4,
          }}
        >
          {canCreateTask && (
            <Tooltip title="Add task to this category">
              <IconButton
                size="small"
                onClick={e => { e.stopPropagation(); onAddTask(); }}
                sx={{ p: 0.3 }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>{collapsed ? "▶" : "▼"}</Typography>
        </Box>
      </Box>

      {/* Rows */}
      {!collapsed && tasks.map(t => (
        <TimelineRow
          key={t._id}
          task={t}
          minDate={minDate}
          dayWidth={dayWidth}
          onBlock={onBlock}
          onOpen={onOpen}
          onEdit={onEdit}
        />
      ))}
    </Box>
  );
}

export default function ProjectTimeline() {
  const { _id: projectId } = useSelector(s => s.project);
  const { workspaceSlug, projectSlug } = useParams();
  const navigate = useNavigate();
  const workspace = useSelector(s => s.workspace);
  const authUser = useSelector(s => s.auth?.data);
  const project = useSelector((s) => s.project);
  const workspaceRole = resolveWorkspaceRole(workspace, authUser);
  const userIsAdmin = isAdmin(workspaceRole);
  const canCreateTask = canCreateProjectTask(project);

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategoryId, setCreateCategoryId] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  // Real-time clock for the indicator line
  const [currentTime, setCurrentTime] = useState(new Date());

  const containerRef = useRef();

  const fetchData = useCallback(async () => {
    if (!projectId) return;
    await Promise.resolve();
    setLoading(true);
    const [taskRes, catRes] = await Promise.all([
      callApi({ method: "get", url: `/tasks/project/${projectId}` }),
      callApi({ method: "get", url: `/tasks/project/${projectId}/categories` }),
    ]);
    if (taskRes.success) setTasks(taskRes.data.data);
    if (catRes.success) setCategories(catRes.data.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { minDate, totalDays, monthSegments, todayOffsetPixels } = useMemo(() => {
    const dates = tasks
      .flatMap(t => [t.startDate, t.deadline].filter(Boolean).map(d => new Date(d)))
      .filter(d => !isNaN(d));

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const baseMin = dates.length ? new Date(Math.min(...dates, today)) : today;
    const baseMax = dates.length ? new Date(Math.max(...dates, today)) : new Date(today.getTime() + 30 * 86400000);

    const viewMin = new Date(baseMin);
    viewMin.setMonth(viewMin.getMonth() - 6); 
    viewMin.setDate(1); // Align to month start
    viewMin.setHours(0,0,0,0);

    const viewMax = new Date(baseMax);
    viewMax.setMonth(viewMax.getMonth() + 6); 
    viewMax.setDate(0);
    viewMax.setHours(23,59,59,999);

    const tDays = getDaysBetween(viewMin, viewMax);

    // Build month header segments
    const mSegments = [];
    let cur = new Date(viewMin);
    while (cur < viewMax) {
      const month = cur.getMonth();
      const year = cur.getFullYear();
      let count = 0;
      while (cur < viewMax && cur.getMonth() === month) {
        cur = new Date(cur.getTime() + 86400000);
        count++;
      }
      mSegments.push({ label: `${MONTHS[month]} ${year}`, days: count, date: new Date(year, month, 1) });
    }

    // Exact pixel offset for real-time indicator line
    const offsetMs = currentTime.getTime() - viewMin.getTime();
    const offsetPixels = (offsetMs / (1000 * 60 * 60 * 24)) * DAY_WIDTH;

    return { minDate: viewMin, maxDate: viewMax, totalDays: tDays, monthSegments: mSegments, todayOffsetPixels: offsetPixels };
  }, [tasks, currentTime]);

  useEffect(() => {
    if (containerRef.current && todayOffsetPixels > 0 && !loading) {
      containerRef.current.scrollLeft = Math.max(0, todayOffsetPixels - 400);
    }
  }, [loading, todayOffsetPixels]); 

  const grouped = {};
  const uncategorized = [];

  tasks.forEach(t => {
    if (!t.categoryId) { uncategorized.push(t); return; }
    const cid = typeof t.categoryId === "object" ? String(t.categoryId._id) : String(t.categoryId);
    if (!grouped[cid]) grouped[cid] = [];
    grouped[cid].push(t);
  });

  const handleBlocked = (updated) => {
    const taskId = updated?.task?._id || updated?._id;
    const nextTask = updated?.task || updated;
    if (!taskId || !nextTask) return;
    setTasks(ts => ts.map(t => t._id === taskId ? { ...t, ...nextTask } : t));
  };

  const handleTaskUpdated = (updatedTask) => {
    const taskId = updatedTask?.task?._id || updatedTask?._id;
    const nextTask = updatedTask?.task || updatedTask;
    if (!taskId || !nextTask) return;
    setTasks((ts) => ts.map((t) => (t._id === taskId ? { ...t, ...nextTask } : t)));
  };

  const handleOpen = (task) => navigate(PROJECT_ROUTES.projectTaskDetail(workspaceSlug, projectSlug, task._id));

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", minWidth: 0 }}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          px: { xs: 1.5, md: 2 },
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          flexShrink: 0,
          gap: 1.5
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={500}>Project Timeline</Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {currentTime.toLocaleString()} — {tasks.length} tasks
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent={{ xs: "flex-start", md: "flex-end" }} flexWrap="wrap" sx={{ width: { xs: "100%", md: "auto" } }}>
          {(userIsAdmin || canCreateTask) && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCreateCategoryId(null); setCreateOpen(true); }} sx={{ borderRadius: 2, flexShrink: 0 }}>
              New Task
            </Button>
          )}
        </Stack>

        {!userIsAdmin && (
          <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2, width: "100%" }}>
            You are viewing only the tasks assigned to you across workflow stages.
          </Alert>
        )}
      </Box>

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ width: "max-content", minWidth: "100%", position: "relative" }}>
          
          <Box
            sx={{
              display: "flex",
              position: "sticky",
              top: 0,
              zIndex: 10,
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
            }}
          >
            <Box sx={{ position: "sticky", left: 0, minWidth: 240, borderRight: "1px solid", borderColor: "divider", px: 1.5, display: "flex", alignItems: "center", bgcolor: "background.paper", zIndex: 11 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">TASK</Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Box sx={{ display: "flex", height: 24, borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.default" }}>
                {monthSegments.map((seg, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: seg.days * DAY_WIDTH,
                      display: "flex",
                      alignItems: "center",
                      px: 1,
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="caption" fontWeight={700} noWrap>{seg.label}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: "flex", height: 22 }}>
                {Array.from({ length: totalDays }).map((_, i) => {
                  const d = new Date(minDate.getTime() + i * 86400000);
                  const isToday = Math.floor(todayOffsetPixels / DAY_WIDTH) === i;
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <Box
                      key={i}
                      sx={{
                        width: DAY_WIDTH,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: "1px solid",
                        borderColor: "divider",
                        bgcolor: isToday ? "primary.main" : isWeekend ? "action.hover" : "transparent",
                        color: isToday ? "primary.contrastText" : "text.secondary",
                        position: "relative"
                      }}
                    >
                      <Typography variant="caption" fontSize={10}>{d.getDate()}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ position: "sticky", right: 0, minWidth: 40, bgcolor: "background.paper", borderLeft: "1px solid", borderColor: "divider", zIndex: 11 }} />
          </Box>

          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 240 + todayOffsetPixels,
              bottom: 0,
              width: 2,
              bgcolor: "error.main",
              opacity: 0.8,
              zIndex: 5,
              pointerEvents: "none",
              boxShadow: "0 0 8px rgba(245,34,45,0.8)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: -4,
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: "error.main"
              }}
            />
          </Box>

          <Box sx={{ pb: 4, position: "relative", zIndex: 2 }}>
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
                  dayWidth={DAY_WIDTH}
                onBlock={setBlockTarget}
                onOpen={handleOpen}
                onEdit={setEditTarget}
                onAddTask={() => { setCreateCategoryId(cat._id); setCreateOpen(true); }}
                canCreateTask={userIsAdmin || canCreateTask}
              />
            );
            })}

            {uncategorized.length > 0 && (
              <CategoryGroup
                label="Uncategorized"
                color={null}
                tasks={uncategorized}
                minDate={minDate}
                dayWidth={DAY_WIDTH}
                onBlock={setBlockTarget}
                onOpen={handleOpen}
                onEdit={setEditTarget}
                onAddTask={() => { setCreateCategoryId(null); setCreateOpen(true); }}
                canCreateTask={userIsAdmin || canCreateTask}
              />
            )}

            {tasks.length === 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 200, position: "sticky", left: 0, width: "100%" }}>
                <Typography color="text.secondary">No tasks yet. Create one to see the timeline.</Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <CreateTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchData()}
        defaultCategoryId={createCategoryId}
      />
      <CreateTaskDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        mode="edit"
        task={editTarget}
        onUpdated={handleTaskUpdated}
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

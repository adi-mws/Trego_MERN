import React, { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Stack, Chip, Tooltip, IconButton,
  Paper, CircularProgress, Button, Tabs, Tab, Avatar, Alert, Badge,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FlagIcon from "@mui/icons-material/Flag";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { callApi } from "../../../api/api";
import CreateTaskDialog from "../tasks/_components/CreateTaskDialog";
import BlockTaskDialog from "../tasks/_components/BlockTaskDialog";
import { PROJECT_ROUTES } from "../../../lib/routes";
import { resolveWorkspaceRole } from "../../../utils/workspaceRole.utils";
import { isAdmin, canCreateProjectTask } from "../../../utils/permissions.utils";

const PRIORITY_COLOR = { LOW: "#52c41a", MEDIUM: "#faad14", HIGH: "#f5222d" };
const PRIORITY_BG = { LOW: "#f6ffed", MEDIUM: "#fffbe6", HIGH: "#fff2f0" };

function isOverdue(task) {
  return task.deadline && !isTaskDone(task) && new Date(task.deadline) < new Date();
}
function isTaskDone(task) {
  return task.currentStage?.isEnd;
}
function isPending(task) {
  return !isTaskDone(task) && !isOverdue(task);
}

function TaskCard({ task, onBlock, onOpen, onEdit }) {
  const borderColor = task.color || "#1976d2";
  const overdueFlag = isOverdue(task);

  return (
    <Paper
      variant="outlined"
      onClick={() => onOpen(task)}
      sx={{
        p: 1.5,
        borderRadius: 2,
        borderLeft: `4px solid ${borderColor}`,
        cursor: "pointer",
        transition: "all 0.18s ease",
        opacity: task.isBlocked ? 0.7 : 1,
        "&:hover": {
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          transform: "translateY(-1px)",
          borderColor: borderColor,
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Typography variant="body2" fontWeight={400} noWrap sx={{ flex: 1, mr: 1 }}>
          {task.isBlocked && <BlockIcon sx={{ fontSize: 13, color: "error.main", mr: 0.5, verticalAlign: "middle" }} />}
          {task.title}
        </Typography>
        <Tooltip title="Open task">
          <IconButton size="small" onClick={e => { e.stopPropagation(); onOpen(task); }} sx={{ p: 0.3 }}>
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit task">
          <IconButton size="small" onClick={e => { e.stopPropagation(); onEdit(task); }} sx={{ p: 0.3, ml: 0.25 }}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      {task.currentStage && (
        <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
          <AccountTreeIcon sx={{ fontSize: 12, color: "text.disabled" }} />
          <Typography variant="caption" color="text.secondary">{task.currentStage.name}</Typography>
        </Stack>
      )}

      <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: PRIORITY_COLOR[task.priority] }} />
        {task.deadline && (
          <Chip
            size="small"
            label={new Date(task.deadline).toLocaleDateString()}
            color={overdueFlag ? "error" : "default"}
            variant={overdueFlag ? "filled" : "outlined"}
            sx={{ fontSize: 10, height: 18 }}
          />
        )}
        <Tooltip title={task.isBlocked ? `Unblock` : "Block task"}>
          <IconButton size="small" onClick={e => { e.stopPropagation(); onBlock(task); }} sx={{ p: 0.3 }}>
            {task.isBlocked
              ? <CheckCircleIcon sx={{ fontSize: 15, color: "success.main" }} />
              : <BlockIcon sx={{ fontSize: 15, color: "text.disabled" }} />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

function CategoryColumn({ category, tasks, onBlock, onOpen, onAddTask, onEdit, tab, canCreateTask }) {
  const filtered = tasks.filter(t => {
    if (tab === 0) return isPending(t);       
    if (tab === 1) return isTaskDone(t);       
    if (tab === 2) return isOverdue(t);       
    return true;
  });

  const borderColor = category.color || "#1976d2";

  return (
    <Box
      sx={{
        minWidth: { xs: 240, sm: 270 },
        maxWidth: { xs: 240, sm: 290 },
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2, py: 1.5,
          borderBottom: "2px solid",
          borderColor: borderColor,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          bgcolor: `${borderColor}10`,
        }}
      >
        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: borderColor, flexShrink: 0 }} />
        <Typography fontWeight={700} fontSize={13} noWrap sx={{ flex: 1 }}>{category.name}</Typography>
        <Badge badgeContent={filtered.length} color="primary" sx={{ "& .MuiBadge-badge": { fontSize: 10, minWidth: 18, height: 18 } }}>
          <Box />
        </Badge>
        {canCreateTask && (
          <Tooltip title="Add task">
            <IconButton size="small" onClick={onAddTask} sx={{ p: 0.3 }}>
              <AddIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Cards */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5, flex: 1, overflowY: "auto", minHeight: 100, maxHeight: "calc(100vh - 300px)" }}>
        {filtered.map(t => <TaskCard key={t._id} task={t} onBlock={onBlock} onOpen={onOpen} onEdit={onEdit} />)}
        {filtered.length === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 1 }}>
            <Typography variant="caption" color="text.disabled">
              {tab === 0 ? "No pending tasks" : tab === 1 ? "No completed tasks" : "No overdue tasks"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default function ProjectTaskBoard() {
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
  const [tab, setTab] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [createCategoryId, setCreateCategoryId] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

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

  const tasksByCategory = {};
  const uncategorized = [];
  tasks.forEach(t => {
    if (!t.categoryId) { uncategorized.push(t); return; }
    const cid = String(t.categoryId);
    if (!tasksByCategory[cid]) tasksByCategory[cid] = [];
    tasksByCategory[cid].push(t);
  });

  const total = tasks.length;
  const pending = tasks.filter(isPending).length;
  const done = tasks.filter(isTaskDone).length;
  const overdue = tasks.filter(isOverdue).length;

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.default", minWidth: 0, overflow: "hidden" }}>
      <Box
        sx={{
          px: { xs: 1.5, md: 3 }, py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          flexShrink: 0,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} mb={1.5} gap={1.5}>
          <Box>
            <Typography variant="h5" fontWeight={500}>Board</Typography>
            <Typography variant="body2" color="text.secondary">{total} tasks total</Typography>
          </Box>
          {(userIsAdmin || canCreateTask) && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setCreateCategoryId(null); setCreateOpen(true); }} sx={{ borderRadius: 2, width: { xs: "100%", sm: "auto" } }}>
              New Task
            </Button>
          )}
        </Stack>

        {!userIsAdmin && (
          <Alert severity="info" sx={{ mb: 1.5, borderRadius: 2 }}>
            You are viewing only the tasks assigned to you across workflow stages.
          </Alert>
        )}

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 36,
            "& .MuiTabs-scroller": { overflowX: "auto !important" },
            "& .MuiTab-root": { minWidth: "auto" },
          }}
          TabIndicatorProps={{ sx: { height: 3, borderRadius: 2 } }}
        >
          <Tab label={<Stack direction="row" spacing={0.8} alignItems="center"><span>Pending</span><Chip label={pending} size="small" color="primary" sx={{ height: 18, fontSize: 10 }} /></Stack>} sx={{ minHeight: 36, textTransform: "none", fontWeight: 600 }} />
          <Tab label={<Stack direction="row" spacing={0.8} alignItems="center"><span>Completed</span><Chip label={done} size="small" color="success" sx={{ height: 18, fontSize: 10 }} /></Stack>} sx={{ minHeight: 36, textTransform: "none", fontWeight: 600 }} />
          <Tab label={<Stack direction="row" spacing={0.8} alignItems="center"><span>Overdue</span><Chip label={overdue} size="small" color="error" sx={{ height: 18, fontSize: 10 }} /></Stack>} sx={{ minHeight: 36, textTransform: "none", fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* ── Board columns ── */}
      <Box sx={{ display: "flex", gap: 2.5, p: { xs: 1.5, md: 2.5 }, overflowX: "auto", flex: 1, alignItems: "flex-start", minWidth: 0, WebkitOverflowScrolling: "touch" }}>
        {categories.map(cat => (
          <CategoryColumn
            key={cat._id}
            category={cat}
            tasks={tasksByCategory[cat._id] || []}
            onBlock={setBlockTarget}
            onOpen={handleOpen}
            onEdit={setEditTarget}
            onAddTask={() => { setCreateCategoryId(cat._id); setCreateOpen(true); }}
            canCreateTask={userIsAdmin || canCreateTask}
            tab={tab}
          />
        ))}

        {uncategorized.length > 0 && (
          <CategoryColumn
            category={{ _id: "none", name: "Uncategorized", color: "#9e9e9e" }}
            tasks={uncategorized}
            onBlock={setBlockTarget}
            onOpen={handleOpen}
            onEdit={setEditTarget}
            onAddTask={() => { setCreateCategoryId(null); setCreateOpen(true); }}
            canCreateTask={userIsAdmin || canCreateTask}
            tab={tab}
          />
        )}

        {categories.length === 0 && (
          <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1.5} mt={8}>
            <Typography color="text.secondary">No categories yet. Create task categories to organize your board.</Typography>
          </Box>
        )}
      </Box>

      <CreateTaskDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreated={fetchData} defaultCategoryId={createCategoryId} />
      <CreateTaskDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        mode="edit"
        task={editTarget}
        onUpdated={handleTaskUpdated}
      />
      {blockTarget && (
        <BlockTaskDialog open={!!blockTarget} task={blockTarget} onClose={() => setBlockTarget(null)} onBlocked={handleBlocked} />
      )}
    </Box>
  );
}

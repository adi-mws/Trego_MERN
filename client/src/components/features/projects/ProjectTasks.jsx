import React, { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Chip,
  CircularProgress, TextField, InputAdornment, Tooltip,
  IconButton, Stack, Avatar, LinearProgress, Select,
  MenuItem, FormControl, InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlagIcon from "@mui/icons-material/Flag";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { callApi } from "../../../api/api";
import CreateTaskDialog from "../tasks/_components/CreateTaskDialog";
import BlockTaskDialog from "../tasks/_components/BlockTaskDialog";
import { PROJECT_ROUTES } from "../../../lib/routes";

const PRIORITY_COLOR = { LOW: "success", MEDIUM: "warning", HIGH: "error" };

export default function ProjectTasks() {
  const { _id: projectId } = useSelector(s => s.project);
  const { workspaceSlug, projectSlug } = useParams();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [blockTarget, setBlockTarget] = useState(null);

  const fetchTasks = useCallback(async () => {
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

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    const matchCategory = !categoryFilter
      ? true
      : categoryFilter === "__none__"
        ? !t.categoryId
        : String(t.categoryId) === categoryFilter;
    return matchSearch && matchPriority && matchCategory;
  });

  const handleTaskBlocked = (updated) => {
    setTasks(ts => ts.map(t => t._id === updated._id ? { ...t, ...updated } : t));
  };

  return (
    <Box sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Tasks</Typography>
          <Typography variant="body2" color="text.secondary">
            {tasks.length} total · {tasks.filter(t => t.isBlocked).length} blocked
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} sx={{ borderRadius: 2 }}>
          New Task
        </Button>
      </Box>

      {/* Filters */}
      <Stack direction="row" spacing={2} mb={2} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search tasks..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: 240 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Priority</InputLabel>
          <Select label="Priority" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {["LOW", "MEDIUM", "HIGH"].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Category</InputLabel>
          <Select label="Category" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="__none__">Uncategorized</MenuItem>
            {categories.map(c => (
              <MenuItem key={c._id} value={c._id}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: c.color }} />
                  <span>{c.name}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, flex: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, bgcolor: "background.default" } }}>
                <TableCell>Title</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Stage</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Deadline</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "text.secondary" }}>
                    No tasks found
                  </TableCell>
                </TableRow>
              ) : filtered.map(task => (
                <TableRow
                  key={task._id}
                  hover
                  onClick={() => navigate(PROJECT_ROUTES.projectTaskDetail(workspaceSlug, projectSlug, task._id))}
                  sx={{
                    opacity: task.isBlocked ? 0.7 : 1,
                    borderLeft: task.color ? `3px solid ${task.color}` : "none",
                    cursor: "pointer",
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {task.isBlocked && (
                        <Tooltip title={`Blocked: ${task.blockedReason}`}>
                          <BlockIcon sx={{ fontSize: 16, color: "error.main" }} />
                        </Tooltip>
                      )}
                      <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 260 }}>
                        {task.title}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {task.category ? (
                      <Chip
                        size="small"
                        label={task.category.name}
                        sx={{ bgcolor: `${task.color}22`, color: task.color, fontWeight: 600, border: `1px solid ${task.color}55` }}
                      />
                    ) : (
                      <Typography variant="caption" color="text.disabled">Uncategorized</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {task.currentStage ? (
                      <Chip size="small" label={task.currentStage.name} variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="text.disabled">No workflow</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      icon={<FlagIcon sx={{ fontSize: "14px !important" }} />}
                      label={task.priority}
                      color={PRIORITY_COLOR[task.priority]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    {task.deadline
                      ? <Typography variant="caption">{new Date(task.deadline).toLocaleDateString()}</Typography>
                      : <Typography variant="caption" color="text.disabled">—</Typography>}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={task.isBlocked ? "Blocked" : "Active"}
                      color={task.isBlocked ? "error" : "success"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={task.isBlocked ? "Unblock task" : "Block task"}>
                      <IconButton size="small" color={task.isBlocked ? "success" : "warning"} onClick={() => setBlockTarget(task)}>
                        {task.isBlocked ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <CreateTaskDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => fetchTasks()}
      />
      {blockTarget && (
        <BlockTaskDialog
          open={!!blockTarget}
          task={blockTarget}
          onClose={() => setBlockTarget(null)}
          onBlocked={handleTaskBlocked}
        />
      )}
    </Box>
  );
}

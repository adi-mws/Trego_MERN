import React, { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Stack, Chip, Avatar, Paper, CircularProgress,
  TextField, InputAdornment, Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";

// ─── State History Page — all project transitions ─────────────────────────────
export default function ProjectTaskStateHistory() {
  const { _id: projectId } = useSelector(s => s.project);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchHistory = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await callApi({ method: "get", url: `/tasks/project/${projectId}/state-history` });
    if (res.success) setHistory(res.data.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = history.filter(h => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      h.taskId?.title?.toLowerCase().includes(q) ||
      h.fromStage?.name?.toLowerCase().includes(q) ||
      h.toStage?.name?.toLowerCase().includes(q) ||
      h.triggeredBy?.name?.toLowerCase().includes(q)
    );
  });

  // Group by task
  const byTask = {};
  filtered.forEach(h => {
    const tid = h.taskId?._id || "unknown";
    if (!byTask[tid]) byTask[tid] = { task: h.taskId, entries: [] };
    byTask[tid].entries.push(h);
  });

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 960, mx: "auto" }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Task State History</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Full audit trail of all workflow stage transitions across the project.
        </Typography>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search by task, stage, or person..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 3 }}
      />

      {Object.values(byTask).length === 0 ? (
        <Box textAlign="center" mt={6}>
          <Typography color="text.disabled">No stage transitions recorded yet.</Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {Object.values(byTask).map(({ task, entries }) => {
            const color = task?.categoryId?.color || "#1976d2";
            const totalDelayed = entries.filter(e => e.wasDelayed).length;
            return (
              <Paper
                key={task?._id || "unknown"}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  borderLeft: `4px solid ${color}`,
                  overflow: "hidden",
                }}
              >
                {/* Task header */}
                <Box sx={{ px: 2.5, py: 1.5, bgcolor: `${color}10`, borderBottom: "1px solid", borderColor: "divider" }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                    <Typography fontWeight={700}>{task?.title || "Unknown Task"}</Typography>
                    {totalDelayed > 0 && (
                      <Chip
                        size="small"
                        icon={<WarningAmberIcon sx={{ fontSize: "13px !important" }} />}
                        label={`${totalDelayed} delayed stage${totalDelayed > 1 ? "s" : ""}`}
                        color="warning"
                      />
                    )}
                    <Box flex={1} />
                    <Typography variant="caption" color="text.secondary">{entries.length} transitions</Typography>
                  </Stack>
                </Box>

                {/* Timeline entries */}
                <Box sx={{ px: 2.5, py: 1.5 }}>
                  {entries.map((entry, i) => {
                    const durationMs = entry.exitedAt
                      ? new Date(entry.exitedAt) - new Date(entry.enteredAt)
                      : Date.now() - new Date(entry.enteredAt);
                    const durationH = (durationMs / 3600000).toFixed(1);
                    const isCurrent = !entry.exitedAt;

                    return (
                      <React.Fragment key={entry._id}>
                        {i > 0 && <Divider sx={{ my: 1 }} />}
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          {/* Icon */}
                          <Box sx={{ pt: 0.3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            {entry.wasDelayed
                              ? <WarningAmberIcon sx={{ fontSize: 18, color: "warning.main" }} />
                              : isCurrent
                                ? <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "primary.main", mt: 0.3, animation: "pulse2 1.5s infinite", "@keyframes pulse2": { "0%,100%": { opacity: 1 }, "50%": { opacity: 0.4 } } }} />
                                : <CheckCircleIcon sx={{ fontSize: 18, color: "success.main" }} />}
                          </Box>

                          <Box flex={1}>
                            {/* Stage flow */}
                            <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap">
                              {entry.fromStage ? (
                                <Chip size="small" label={entry.fromStage.name} variant="outlined" />
                              ) : (
                                <Chip size="small" label="Created" color="info" variant="outlined" />
                              )}
                              <ArrowForwardIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                              <Chip
                                size="small"
                                label={entry.toStage?.name || "?"}
                                color={isCurrent ? "primary" : entry.wasDelayed ? "warning" : "success"}
                                variant={isCurrent ? "filled" : "outlined"}
                              />
                              {isCurrent && <Chip size="small" label="Current" color="primary" />}
                            </Stack>

                            {/* Meta */}
                            <Stack direction="row" spacing={2} mt={0.5} flexWrap="wrap">
                              <Typography variant="caption" color="text.secondary">
                                {new Date(entry.enteredAt).toLocaleString()}
                              </Typography>
                              <Typography variant="caption" color={entry.wasDelayed ? "warning.main" : "text.secondary"} fontWeight={entry.wasDelayed ? 700 : 400}>
                                ⏱ {durationH}h
                              </Typography>
                              {entry.triggeredBy && (
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Avatar sx={{ width: 16, height: 16, fontSize: 8 }}>{entry.triggeredBy.name?.[0]}</Avatar>
                                  <Typography variant="caption" color="text.secondary">{entry.triggeredBy.name}</Typography>
                                </Stack>
                              )}
                            </Stack>

                            {entry.comment && (
                              <Typography variant="caption" color="text.secondary" fontStyle="italic" display="block" mt={0.3}>
                                "{entry.comment}"
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </React.Fragment>
                    );
                  })}
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

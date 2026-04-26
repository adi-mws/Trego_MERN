import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Stack,
  Chip,
  Box,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { callApi } from "../../../../api/api";
import { useSelector } from "react-redux";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const PRIORITY_COLOR = { LOW: "success", MEDIUM: "warning", HIGH: "error" };

function toDateOrNull(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getStartOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

export default function CreateTaskDialog({
  open,
  onClose,
  onCreated,
  onUpdated,
  defaultCategoryId,
  mode = "create",
  task = null,
  workflowDisabled = false,
  workflowHelperText = "",
}) {
  const { _id: projectId } = useSelector((s) => s.project);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    startDate: null,
    deadline: null,
    categoryId: defaultCategoryId || "",
    workflowId: "",
  });
  const [categories, setCategories] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !projectId) return;

    const timer = window.setTimeout(() => {
      setError("");
      if (mode === "edit" && task) {
        setForm({
          title: task.title || "",
          description: task.description || "",
          priority: task.priority || "MEDIUM",
          startDate: toDateOrNull(task.startDate),
          deadline: toDateOrNull(task.deadline),
          categoryId: task.categoryId?._id || task.categoryId || "",
          workflowId: task.workflowId?._id || task.workflowId || "",
        });
      } else {
        setForm({
          title: "",
          description: "",
          priority: "MEDIUM",
          startDate: null,
          deadline: null,
          categoryId: defaultCategoryId || "",
          workflowId: "",
        });
      }

      callApi({ method: "get", url: `/tasks/project/${projectId}/categories` }).then((r) => {
        if (r.success) setCategories(r.data.data);
      });

      callApi({ method: "get", url: `/workflows/project/${projectId}` }).then((r) => {
        if (r.success) {
          setWorkflows(
            r.data.data.filter((w) => w.isActive || w?.usage?.isUsed || (w?.usage?.totalCount || 0) > 0)
          );
        }
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, projectId, defaultCategoryId, mode, task]);

  const selectedCategory = categories.find((c) => c._id === form.categoryId);
  const today = getStartOfToday();

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }

    if (mode === "create" && form.startDate && new Date(form.startDate) < today) {
      setError("Start date cannot be in the past");
      return;
    }

    if (mode === "create" && form.deadline && new Date(form.deadline) < today) {
      setError("Deadline cannot be in the past");
      return;
    }

    if (form.startDate && form.deadline && new Date(form.startDate) > new Date(form.deadline)) {
      setError("Start date cannot be after the deadline");
      return;
    }

    setLoading(true);
    setError("");

    const payload = {
      title: form.title,
      description: form.description,
      priority: form.priority,
      startDate: form.startDate || undefined,
      deadline: form.deadline || undefined,
      categoryId: form.categoryId || undefined,
      workflowId: form.workflowId || undefined,
    };

    const res = await callApi(
      mode === "edit" && task?._id
        ? { method: "put", url: `/tasks/${task._id}`, data: payload }
        : { method: "post", url: `/tasks/project/${projectId}`, data: payload }
    );

    setLoading(false);

    if (res.success) {
      const responseData = res.data?.data || null;
      const updatedTask = responseData?.task || responseData;

      if (mode === "edit") {
        onUpdated?.(responseData || updatedTask);
      } else {
        onCreated?.(updatedTask);
      }
      onClose();
    } else {
      setError(res.error?.message || "Failed to save task");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle fontWeight={700}>{mode === "edit" ? "Edit Task" : "Create Task"}</DialogTitle>
        <Divider />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Task Title"
            fullWidth
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            size="small"
            autoFocus
            required
          />

          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            size="small"
          />

          <TextField
            select
            label="Priority"
            value={form.priority}
            onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            size="small"
          >
            {PRIORITIES.map((p) => (
              <MenuItem key={p} value={p}>
                <Chip label={p} size="small" color={PRIORITY_COLOR[p]} sx={{ minWidth: 60 }} />
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={2}>
            <DatePicker
              label="Start Date"
              value={form.startDate}
              onChange={(v) => setForm((f) => ({ ...f, startDate: v }))}
              disablePast={mode === "create"}
              minDate={mode === "create" ? today : undefined}
              maxDate={form.deadline || undefined}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { flex: 1 },
                  helperText: mode === "create" ? "Today or later" : "When this task begins",
                },
              }}
            />
            <DatePicker
              label="Deadline"
              value={form.deadline}
              onChange={(v) => setForm((f) => ({ ...f, deadline: v }))}
              disablePast={mode === "create"}
              minDate={mode === "create" ? (form.startDate || today) : (form.startDate || undefined)}
              slotProps={{
                textField: {
                  size: "small",
                  sx: { flex: 1 },
                  helperText: mode === "create" ? "Today or later" : "Due date",
                },
              }}
            />
          </Stack>

          <TextField
            select
            label="Category (optional)"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value, workflowId: "" }))}
            size="small"
          >
            <MenuItem value="">Uncategorized</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c.color }} />
                  <span>{c.name}</span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          {workflows.length > 0 && (
            <TextField
              select
              label={selectedCategory?.defaultWorkflow ? "Workflow (category default available)" : "Workflow (optional)"}
              value={form.workflowId}
              onChange={(e) => setForm((f) => ({ ...f, workflowId: e.target.value }))}
              size="small"
              disabled={workflowDisabled}
              helperText={
                workflowHelperText ||
                (selectedCategory?.defaultWorkflow && !form.workflowId
                  ? `Will use "${selectedCategory.defaultWorkflow.name}" by default`
                  : "")
              }
            >
              <MenuItem value="">None / Use category default</MenuItem>
              {workflows.map((wf) => (
                <MenuItem key={wf._id} value={wf._id}>
                  {wf.name} â€” V{wf.version}
                  {selectedCategory?.defaultWorkflowId === wf._id && (
                    <Chip label="Category Default" size="small" color="primary" sx={{ ml: 1 }} />
                  )}
                </MenuItem>
              ))}
            </TextField>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? <CircularProgress size={18} /> : mode === "edit" ? "Save Changes" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

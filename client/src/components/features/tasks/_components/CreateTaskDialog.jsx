import React, { useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Button, CircularProgress, Alert,
  Divider, Stack, Chip, Box, Typography, Autocomplete,
} from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { callApi } from "../../../../api/api";
import { useSelector } from "react-redux";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const PRIORITY_COLOR = { LOW: "success", MEDIUM: "warning", HIGH: "error" };

export default function CreateTaskDialog({ open, onClose, onCreated, defaultCategoryId }) {
  const { _id: projectId } = useSelector(s => s.project);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
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
    setError("");
    setForm(f => ({ ...f, categoryId: defaultCategoryId || "", workflowId: "" }));

    callApi({ method: "get", url: `/tasks/project/${projectId}/categories` })
      .then(r => { if (r.success) setCategories(r.data.data); });

    callApi({ method: "get", url: `/workflows/project/${projectId}` })
      .then(r => { if (r.success) setWorkflows(r.data.data.filter(w => w.isActive)); });
  }, [open, projectId, defaultCategoryId]);

  const selectedCategory = categories.find(c => c._id === form.categoryId);

  // Available workflows: category's defaultWorkflow + any other active workflow
  const availableWorkflows = workflows;

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError("");
    const res = await callApi({
      method: "post",
      url: `/tasks/project/${projectId}`,
      data: {
        title: form.title,
        description: form.description,
        priority: form.priority,
        deadline: form.deadline || undefined,
        categoryId: form.categoryId || undefined,
        workflowId: form.workflowId || undefined,
      },
    });
    setLoading(false);
    if (res.success) {
      onCreated?.(res.data.data);
      onClose();
    } else {
      setError(res.error?.message || "Failed to create task");
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
        <DialogTitle fontWeight={700}>Create Task</DialogTitle>
        <Divider />
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Task Title"
            fullWidth
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
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
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            size="small"
          />

          <Stack direction="row" spacing={2}>
            {/* Priority */}
            <TextField
              select
              label="Priority"
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              size="small"
              sx={{ flex: 1 }}
            >
              {PRIORITIES.map(p => (
                <MenuItem key={p} value={p}>
                  <Chip label={p} size="small" color={PRIORITY_COLOR[p]} sx={{ minWidth: 60 }} />
                </MenuItem>
              ))}
            </TextField>

            {/* Deadline */}
            <DateTimePicker
              label="Deadline"
              value={form.deadline}
              onChange={v => setForm(f => ({ ...f, deadline: v }))}
              slotProps={{ textField: { size: "small", sx: { flex: 1 } } }}
            />
          </Stack>

          {/* Category */}
          <TextField
            select
            label="Category (optional)"
            value={form.categoryId}
            onChange={e => setForm(f => ({ ...f, categoryId: e.target.value, workflowId: "" }))}
            size="small"
          >
            <MenuItem value="">Uncategorized</MenuItem>
            {categories.map(c => (
              <MenuItem key={c._id} value={c._id}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: c.color }} />
                  <span>{c.name}</span>
                </Stack>
              </MenuItem>
            ))}
          </TextField>

          {/* Workflow — shown only if category has one OR there are active workflows */}
          {availableWorkflows.length > 0 && (
            <TextField
              select
              label={selectedCategory?.defaultWorkflow ? "Workflow (category default available)" : "Workflow (optional)"}
              value={form.workflowId}
              onChange={e => setForm(f => ({ ...f, workflowId: e.target.value }))}
              size="small"
              helperText={selectedCategory?.defaultWorkflow && !form.workflowId
                ? `Will use "${selectedCategory.defaultWorkflow.name}" by default`
                : ""}
            >
              <MenuItem value="">None / Use category default</MenuItem>
              {availableWorkflows.map(wf => (
                <MenuItem key={wf._id} value={wf._id}>
                  {wf.name} — V{wf.version}
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
            {loading ? <CircularProgress size={18} /> : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Avatar,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import FolderOffIcon from "@mui/icons-material/FolderOff";
import CategoryIcon from "@mui/icons-material/Category";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import ProjectPermissionGate from "../projects/_components/ProjectPermissionGate";

const COLOR_PRESETS = [
  "#1890ff", "#52c41a", "#faad14", "#f5222d",
  "#722ed1", "#13c2c2", "#eb2f96", "#fa541c",
  "#2f54eb", "#fadb14",
];

function CategoryDialog({ open, onClose, onSave, initial, workflows, loading }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    color: "#1890ff",
    defaultWorkflowId: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      const timer = window.setTimeout(() => {
        setError("");
        setForm({
          name: initial?.name || "",
          description: initial?.description || "",
          color: initial?.color || "#1890ff",
          defaultWorkflowId: initial?.defaultWorkflowId?._id || initial?.defaultWorkflowId || "",
        });
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [open, initial]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Category name is required"); return; }
    setError("");
    await onSave({ ...form, defaultWorkflowId: form.defaultWorkflowId || null });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, mx: { xs: 1, sm: 2 } } }}
    >
      <DialogTitle fontWeight={700}>{initial ? "Edit Category" : "New Task Category"}</DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          label="Category Name"
          fullWidth
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          size="small"
          autoFocus
        />

        <TextField
          label="Description"
          fullWidth
          multiline
          rows={2}
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          size="small"
        />

        {/* Color picker */}
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            Color
          </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {COLOR_PRESETS.map(c => (
              <Box
                key={c}
                onClick={() => setForm(f => ({ ...f, color: c }))}
                sx={{
                  width: 26, height: 26,
                  borderRadius: "50%",
                  bgcolor: c,
                  cursor: "pointer",
                  border: form.color === c ? "3px solid #000" : "3px solid transparent",
                  transition: "transform 0.1s",
                  "&:hover": { transform: "scale(1.2)" },
                }}
              />
            ))}
            <TextField
              size="small"
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              InputProps={{ startAdornment: <InputAdornment position="start"><Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: form.color }} /></InputAdornment> }}
              sx={{ width: { xs: "100%", sm: 120 }, minWidth: { xs: "100%", sm: 120 } }}
            />
          </Stack>
        </Box>

        {/* Default Workflow */}
        <TextField
          select
          label="Default Workflow (optional)"
          fullWidth
          value={form.defaultWorkflowId}
          onChange={e => setForm(f => ({ ...f, defaultWorkflowId: e.target.value }))}
          size="small"
          helperText="Tasks in this category can use this workflow by default"
        >
          <MenuItem value="">None</MenuItem>
          {workflows.map(wf => (
            <MenuItem key={wf._id} value={wf._id}>
              {wf.name} — V{wf.version}
              {wf.isActive && <Chip label="Active" size="small" color="success" sx={{ ml: 1 }} />}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="text">Cancel</Button>
        <Button onClick={handleSave} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={18} /> : initial ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeleteCategoryDialog({ open, onClose, onConfirm, category, loading }) {
  const blocked = category?.taskCount > 0;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, mx: { xs: 1, sm: 2 } } }}
    >
      <DialogTitle fontWeight={700} color="error">Delete Category</DialogTitle>
      <Divider />
      <DialogContent>
        {blocked ? (
          <Alert severity="error" sx={{ mt: 1 }}>
            <strong>{category?.name}</strong> has <strong>{category?.taskCount} task(s)</strong>. 
            Uncategorize all tasks before deleting.
          </Alert>
        ) : (
          <Typography>
            Are you sure you want to delete <strong>{category?.name}</strong>? This cannot be undone.
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained" disabled={blocked || loading}>
          {loading ? <CircularProgress size={18} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const TaskCategories = () => {
  const { _id: projectId } = useSelector(state => state.project);

  const [categories, setCategories] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCategories = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await callApi({ method: "get", url: `/tasks/project/${projectId}/categories` });
    if (res.success) setCategories(res.data.data);
    else setError(res.error?.message || "Failed to load categories");
    setLoading(false);
  }, [projectId]);

  const fetchWorkflows = useCallback(async () => {
    if (!projectId) return;
    const res = await callApi({ method: "get", url: `/workflows/project/${projectId}` });
    if (res.success) {
      setWorkflows(res.data.data.filter((wf) => wf.isActive || wf?.usage?.isUsed || (wf?.usage?.totalCount || 0) > 0));
    }
  }, [projectId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchCategories();
      void fetchWorkflows();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchCategories, fetchWorkflows]);

  const handleCreate = async (form) => {
    setSaving(true);
    setError("");
    const res = await callApi({
      method: "post",
      url: `/tasks/project/${projectId}/categories`,
      data: form,
    });
    setSaving(false);
    if (res.success) {
      setCreateOpen(false);
      fetchCategories();
    } else {
      setError(res.error?.message || "Failed to create category");
    }
  };

  const handleEdit = async (form) => {
    if (!editTarget) return;
    setSaving(true);
    setError("");
    const res = await callApi({
      method: "put",
      url: `/tasks/categories/${editTarget._id}`,
      data: form,
    });c
    setSaving(false);
    if (res.success) {
      setEditTarget(null);
      fetchCategories();
    } else {
      setError(res.error?.message || "Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const res = await callApi({ method: "delete", url: `/tasks/categories/${deleteTarget._id}` });
    setSaving(false);
    if (res.success) {
      setDeleteTarget(null);
      fetchCategories();
    } else {
      setError(res.error?.message || "Cannot delete category");
    }
  };

  return (
    <ProjectPermissionGate
      permission="canManageProject"
      title="You do not have permission to manage task categories"
      message="Ask a project admin to change task categories."
    >
    <Box sx={{ p: { xs: 1.5, md: 3 }, width: "100%", maxWidth: "none", mx: 0, minWidth: 0 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} flexDirection={{ xs: "column", sm: "row" }} mb={3} gap={1.5}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" fontWeight={500}>Task Categories</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Organize tasks into groups, assign colors and default workflows.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateOpen(true)}
          sx={{ borderRadius: 2, width: { xs: "100%", sm: "auto" } }}
        >
          New Category
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Loading */}
      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          mt={8}
          gap={2}
        >
          <CategoryIcon sx={{ fontSize: 64, color: "action.disabled" }} />
          <Typography color="text.secondary">No categories yet. Create one to organize your tasks.</Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Create First Category
          </Button>
        </Box>
      ) : (
        <Stack spacing={2}>
          {categories.map(category => (
            <Card
              key={category._id}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                borderLeft: `4px solid ${category.color || "#1890ff"}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.10)" },
              }}
            >
              <CardContent sx={{ pb: "12px !important" }}>
                <Box display="flex" justifyContent="space-between" alignItems={{ xs: "flex-start", md: "flex-start" }} flexDirection={{ xs: "column", md: "row" }} gap={2}>
                  {/* Left: name + meta */}
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                      <Avatar sx={{ width: 20, height: 20, bgcolor: category.color, fontSize: 10 }}>
                        {category.name?.[0]?.toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {category.name}
                      </Typography>
                      <Chip
                        size="small"
                        icon={<TaskAltIcon sx={{ fontSize: "14px !important" }} />}
                        label={`${category.taskCount} task${category.taskCount !== 1 ? "s" : ""}`}
                        sx={{ bgcolor: "action.hover" }}
                      />
                    </Stack>

                    {category.description && (
                      <Typography variant="body2" color="text.secondary" mt={0.5} ml={{ xs: 0, md: 4.5 }}>
                        {category.description}
                      </Typography>
                    )}

                    {category.defaultWorkflow && (
                      <Stack direction="row" alignItems="center" spacing={0.5} mt={1} ml={{ xs: 0, md: 4.5 }} flexWrap="wrap">
                        <AccountTreeOutlinedIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary">
                          Default Workflow:&nbsp;
                          <strong>{category.defaultWorkflow.name}</strong>&nbsp;
                          V{category.defaultWorkflow.version}
                        </Typography>
                      </Stack>
                    )}

                    {!category.defaultWorkflow && (
                      <Stack direction="row" alignItems="center" spacing={0.5} mt={1} ml={{ xs: 0, md: 4.5 }}>
                        <FolderOffIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        <Typography variant="caption" color="text.disabled">
                          No default workflow
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  {/* Actions */}
                  <Stack direction="row" spacing={0.5} justifyContent={{ xs: "flex-start", md: "flex-end" }} alignSelf={{ xs: "flex-end", md: "flex-start" }}>
                    <Tooltip title="Edit category">
                      <IconButton size="small" onClick={() => setEditTarget(category)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={category.taskCount > 0 ? "Uncategorize all tasks first" : "Delete category"}>
                      <span>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteTarget(category)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <CategoryDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        workflows={workflows}
        loading={saving}
      />

      <CategoryDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        initial={editTarget}
        workflows={workflows}
        loading={saving}
      />

      <DeleteCategoryDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        category={deleteTarget}
        loading={saving}
      />
    </Box>
    </ProjectPermissionGate>
  );
};

export default TaskCategories;

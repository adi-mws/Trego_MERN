import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Avatar, Stack, Typography,
  Checkbox, FormControlLabel, Chip, Box, Alert, Divider,
  TextField, InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { callApi } from "../../../../api/api";
import { getImageUrl } from "../../../../utils/image.utils";

/**
 * TaskAssigneeManager — admin-only dialog to assign project members to a task.
 * Props:
 *   open         - boolean
 *   onClose      - () => void
 *   taskId       - string
 *   projectId    - string
 *   currentAssignees - array of user objects or ids already on the task
 *   onUpdated    - (updatedTask) => void
 */
export default function TaskAssigneeManager({
  open,
  onClose,
  taskId,
  projectId,
  currentAssignees = [],
  onUpdated,
}) {
  const [members, setMembers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchMembers = useCallback(async () => {
    if (!projectId || !open) return;
    setLoading(true);
    try {
      const res = await callApi({
        method: "get",
        url: `/projects/${projectId}/members`,
      });
      if (res.success) {
        setMembers(res.data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, open]);

  useEffect(() => {
    if (open) {
      fetchMembers();
      setError("");
      // Pre-select existing assignees
      const ids = currentAssignees.map((a) => String(a?._id || a?.id || a));
      setSelected(ids);
      setSearch("");
    }
  }, [open, fetchMembers]);

  const toggle = (userId) => {
    setSelected((prev) =>
      prev.includes(String(userId))
        ? prev.filter((id) => id !== String(userId))
        : [...prev, String(userId)]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await callApi({
        method: "patch",
        url: `/tasks/${taskId}/assignees`,
        data: { assignees: selected },
      });
      if (res.success) {
        onUpdated?.(res.data.data);
        onClose();
      } else {
        setError(res.error?.message || "Failed to update assignees");
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      m.user?.name?.toLowerCase().includes(q) ||
      m.user?.email?.toLowerCase().includes(q)
    );
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <PersonAddIcon color="primary" />
          <Box>
            <Typography fontWeight={700}>Assign Members</Typography>
            <Typography variant="caption" color="text.secondary">
              Only project members can be assigned to tasks
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ pt: 2, pb: 1 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField
          size="small"
          fullWidth
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18 }} />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress size={28} />
          </Box>
        ) : filteredMembers.length === 0 ? (
          <Box textAlign="center" py={3}>
            <Typography color="text.secondary" variant="body2">
              {members.length === 0
                ? "No project members found. Add members to this project first."
                : "No members match your search"}
            </Typography>
          </Box>
        ) : (
          <Stack spacing={0.5}>
            {filteredMembers.map((membership) => {
              const userId = String(membership.user?._id || membership.user?.id);
              const isChecked = selected.includes(userId);
              return (
                <Box
                  key={userId}
                  onClick={() => toggle(userId)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isChecked ? "primary.main" : "divider",
                    bgcolor: isChecked ? "primary.50" : "transparent",
                    cursor: "pointer",
                    transition: "0.15s",
                    "&:hover": { bgcolor: isChecked ? "primary.100" : "action.hover" },
                  }}
                >
                  <Checkbox
                    checked={isChecked}
                    size="small"
                    color="primary"
                    sx={{ p: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggle(userId)}
                  />
                  <Avatar
                    src={getImageUrl(membership.user?.avatar)}
                    sx={{ width: 32, height: 32, fontSize: 13 }}
                  >
                    {membership.user?.name?.[0]}
                  </Avatar>
                  <Box flex={1} minWidth={0}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {membership.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {membership.user?.email}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
                    {(membership.roles || []).map((role) => (
                      <Chip
                        key={role._id}
                        label={role.name}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10, height: 20 }}
                      />
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        )}

        {selected.length > 0 && (
          <Box mt={2} p={1.5} borderRadius={2} bgcolor="action.hover">
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              {selected.length} member{selected.length > 1 ? "s" : ""} selected
            </Typography>
          </Box>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          startIcon={saving ? <CircularProgress size={14} /> : null}
        >
          {saving ? "Saving..." : "Save Assignees"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

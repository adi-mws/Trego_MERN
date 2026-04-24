import React, { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Alert, CircularProgress, Typography, Divider,
} from "@mui/material";
import { callApi } from "../../../../api/api";

export default function BlockTaskDialog({ open, onClose, task, onBlocked }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBlock = async () => {
    if (!reason.trim()) { setError("Please provide a reason"); return; }
    setLoading(true);
    const res = await callApi({
      method: "put",
      url: `/tasks/${task._id}`,
      data: { isBlocked: true, blockedReason: reason },
    });
    setLoading(false);
    if (res.success) {
      onBlocked?.(res.data.data);
      onClose();
    } else {
      setError(res.error?.message || "Failed to block task");
    }
  };

  const handleUnblock = async () => {
    setLoading(true);
    const res = await callApi({
      method: "put",
      url: `/tasks/${task._id}`,
      data: { isBlocked: false, blockedReason: "" },
    });
    setLoading(false);
    if (res.success) {
      onBlocked?.(res.data.data);
      onClose();
    } else {
      setError(res.error?.message || "Failed to unblock task");
    }
  };

  const isBlocked = task?.isBlocked;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle fontWeight={700} color={isBlocked ? "success.main" : "warning.main"}>
        {isBlocked ? "Unblock Task" : "Block Task"}
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ pt: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        <Typography variant="body2" color="text.secondary" mb={2}>
          {isBlocked
            ? `Currently blocked: "${task?.blockedReason || "No reason given"}"`
            : `Block "${task?.title}" and provide a reason.`}
        </Typography>
        {!isBlocked && (
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Block Reason"
            value={reason}
            onChange={e => { setReason(e.target.value); setError(""); }}
            placeholder="e.g. Waiting for API spec, blocked by dependency..."
            size="small"
            autoFocus
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        {isBlocked ? (
          <Button variant="contained" color="success" onClick={handleUnblock} disabled={loading}>
            {loading ? <CircularProgress size={18} /> : "Unblock"}
          </Button>
        ) : (
          <Button variant="contained" color="warning" onClick={handleBlock} disabled={loading}>
            {loading ? <CircularProgress size={18} /> : "Block Task"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

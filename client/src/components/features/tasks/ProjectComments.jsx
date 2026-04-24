import React, { useCallback, useEffect, useState } from "react";
import {
  Box, Typography, Stack, Chip, Avatar, Paper, CircularProgress,
  TextField, InputAdornment, Divider, IconButton, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { callApi } from "../../../api/api";
import { PROJECT_ROUTES } from "../../../lib/routes";

export default function ProjectComments() {
  const { _id: projectId } = useSelector(s => s.project);
  const { workspaceSlug, projectSlug } = useParams();
  const currentUser = useSelector(s => s.auth?.user);
  const navigate = useNavigate();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchComments = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await callApi({ method: "get", url: `/tasks/project/${projectId}/comments` });
    if (res.success) setComments(res.data.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleDelete = async (commentId) => {
    await callApi({ method: "delete", url: `/tasks/comments/${commentId}` });
    fetchComments();
  };

  const filtered = comments.filter(c => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.content?.toLowerCase().includes(q) ||
      c.user?.name?.toLowerCase().includes(q) ||
      c.taskId?.title?.toLowerCase().includes(q)
    );
  });

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100%">
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Project Comments</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          All comments across tasks in this project.
        </Typography>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Search comments..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        sx={{ mb: 3 }}
      />

      {filtered.length === 0 ? (
        <Box textAlign="center" mt={6}>
          <Typography color="text.disabled">No comments yet.</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {filtered.map(comment => {
            const taskColor = comment.taskId?.categoryId?.color;
            const isOwn = String(comment.user?._id) === String(currentUser?._id || currentUser?.id);
            return (
              <Paper
                key={comment._id}
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  borderLeft: taskColor ? `3px solid ${taskColor}` : undefined,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
                }}
              >
                <Stack direction="row" spacing={1.5}>
                  <Avatar sx={{ width: 34, height: 34, fontSize: 13 }}>
                    {comment.user?.name?.[0] || "?"}
                  </Avatar>
                  <Box flex={1}>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                      <Typography variant="body2" fontWeight={700}>{comment.user?.name}</Typography>
                      <Typography variant="caption" color="text.disabled">
                        {new Date(comment.createdAt).toLocaleString()}
                      </Typography>
                      {comment.taskId && (
                        <Chip
                          size="small"
                          label={comment.taskId.title}
                          onClick={() => navigate(PROJECT_ROUTES.projectTaskDetail(workspaceSlug, projectSlug, comment.taskId._id))}
                          sx={{
                            fontSize: 10,
                            height: 18,
                            cursor: "pointer",
                            bgcolor: taskColor ? `${taskColor}18` : undefined,
                            color: taskColor || undefined,
                            "&:hover": { opacity: 0.8 },
                          }}
                        />
                      )}
                    </Stack>
                    <Typography variant="body2" mt={0.5} color="text.primary" lineHeight={1.7}>
                      {comment.content}
                    </Typography>
                  </Box>
                  {isOwn && (
                    <Tooltip title="Delete comment">
                      <IconButton size="small" color="error" onClick={() => handleDelete(comment._id)} sx={{ alignSelf: "flex-start" }}>
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

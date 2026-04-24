import { Box, Typography, Divider, Tabs, Tab, Stack, Avatar, TextField, IconButton, CircularProgress, Tooltip } from "@mui/material";
import { useEffect, useCallback, useState } from "react";
import { debounce } from 'lodash';
import SendIcon from "@mui/icons-material/Send";
import DeleteIcon from "@mui/icons-material/Delete";

import { useDispatch, useSelector } from "react-redux"
import WorkflowNodesNotSelected from "./WorkflowNodesNotSelected";
import WorkflowSidebarHeader from "./WorkflowSIdebarHeader";
import WorkflowEdgeEditor from "./WorkflowEdgeEditor";
import WorkflowNodeEditor from "./WorkflowNodeEditor";
import { saveWorkflowTemplate } from "../../../../redux/slices/workflowSlice";
import { useParams } from "react-router-dom";
import { callApi } from "../../../../api/api";

function CommentsPanel({ projectId }) {
  const currentUser = useSelector(s => s.auth?.user);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const res = await callApi({ method: "get", url: `/tasks/project/${projectId}/comments` });
    if (res.success) setComments(res.data.data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleDelete = async (id) => {
    await callApi({ method: "delete", url: `/tasks/comments/${id}` });
    fetch();
  };

  if (loading) return <Box display="flex" justifyContent="center" p={3}><CircularProgress size={24} /></Box>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {comments.length === 0 && (
          <Typography variant="caption" color="text.disabled" textAlign="center" mt={3} display="block">
            No comments yet
          </Typography>
        )}
        {comments.map(c => {
          const isOwn = String(c.user?._id) === String(currentUser?._id || currentUser?.id);
          return (
            <Box key={c._id} sx={{ "&:hover .del": { opacity: 1 } }}>
              <Stack direction="row" spacing={1}>
                <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>{c.user?.name?.[0] || "?"}</Avatar>
                <Box flex={1}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography variant="caption" fontWeight={700} noWrap>{c.user?.name}</Typography>
                    {c.taskId && (
                      <Typography variant="caption" color="text.disabled" noWrap sx={{ maxWidth: 80 }}>
                        · {c.taskId.title}
                      </Typography>
                    )}
                    {isOwn && (
                      <IconButton className="del" size="small" onClick={() => handleDelete(c._id)} sx={{ opacity: 0, transition: "opacity 0.2s", p: 0.2, color: "error.main" }}>
                        <DeleteIcon sx={{ fontSize: 12 }} />
                      </IconButton>
                    )}
                  </Stack>
                  <Typography variant="caption" sx={{ lineHeight: 1.5 }}>{c.content}</Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>
      <Divider />
      <Box sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={0.5}>
          <TextField
            size="small"
            fullWidth
            placeholder="Comment on project..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey && text.trim()) {
                e.preventDefault();
                // Comments need a taskId — show tip
              }
            }}
            InputProps={{ sx: { fontSize: 12 } }}
            multiline
            maxRows={3}
          />
        </Stack>
        <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
          Open a task to comment on it directly.
        </Typography>
      </Box>
    </Box>
  );
}

export default function WorkflowSidebar() {
  const { selectedEdge, selectedNode, isDirty, isSaving } = useSelector((state) => state.workflow);
  const { _id: projectId } = useSelector(s => s.project);
  const dispatch = useDispatch();
  const [tab, setTab] = useState(0);

  const { workflowId } = useParams();

  const debouncedSave = useCallback(debounce((id) => {
    if (id) {
      dispatch(saveWorkflowTemplate(id));
    }
  }, 1000), [dispatch]);

  useEffect(() => {
    if (isDirty && !isSaving) {
      debouncedSave(workflowId);
    }
  }, [isDirty, isSaving, debouncedSave, workflowId]);

  return (
    <Box
      sx={{
        width: 300,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderLeft: "1px solid",
        borderColor: "divider",
      }}
    >
      <WorkflowSidebarHeader workflowName={"Development Workflow"} />

      {/* Tab selector */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ minHeight: 36, borderBottom: "1px solid", borderColor: "divider" }}
        TabIndicatorProps={{ sx: { height: 2 } }}
      >
        <Tab label="Editor" sx={{ minHeight: 36, textTransform: "none", fontSize: 12, fontWeight: 600 }} />
        <Tab label="Comments" sx={{ minHeight: 36, textTransform: "none", fontSize: 12, fontWeight: 600 }} />
      </Tabs>

      {tab === 0 && (
        <Box sx={{ flex: 1, overflowY: "auto", p: 2, minHeight: 0 }}>
          {(!selectedNode && !selectedEdge) ? (
            <WorkflowNodesNotSelected />
          ) : selectedNode ? (
            <WorkflowNodeEditor />
          ) : (
            <WorkflowEdgeEditor />
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <CommentsPanel projectId={projectId} />
        </Box>
      )}
    </Box>
  );
}
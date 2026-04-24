import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import FlagIcon from "@mui/icons-material/Flag";
import PersonIcon from "@mui/icons-material/Person";
import SendIcon from "@mui/icons-material/Send";
import ShieldIcon from "@mui/icons-material/Shield";
import BlockIcon from "@mui/icons-material/Block";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { callApi } from "../../../api/api";
import BlockTaskDialog from "../tasks/_components/BlockTaskDialog";

const PRIORITY_META = {
  LOW: { label: "Low", color: "success" },
  MEDIUM: { label: "Medium", color: "warning" },
  HIGH: { label: "High", color: "error" },
};

function getId(value) {
  return value?._id || value?.id || value || null;
}

function normalizeCurrentUser(userState) {
  return userState?.user || userState || null;
}

function formatDuration(start, end) {
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  const hours = Math.max(0, (endDate - startDate) / 3600000);
  if (hours < 1) {
    const minutes = Math.max(1, Math.round((endDate - startDate) / 60000));
    return `${minutes}m`;
  }
  return `${hours.toFixed(hours >= 10 ? 0 : 1)}h`;
}

function StageRoleChips({ roles, emptyLabel = "Open access" }) {
  if (!roles || roles.length === 0) {
    return <Chip size="small" label={emptyLabel} variant="outlined" sx={{ fontSize: 11 }} />;
  }

  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      {roles.map((role) => (
        <Chip
          key={role._id || role.name}
          size="small"
          label={role.name}
          variant="outlined"
          sx={{
            fontSize: 11,
            borderColor: role.color || "divider",
            color: role.color || "text.primary",
            bgcolor: role.color ? `${role.color}14` : "transparent",
          }}
        />
      ))}
    </Stack>
  );
}

function SubtaskItem({ subtask, onToggle, onDelete }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ py: 0.5, "&:hover .delete-btn": { opacity: 1 } }}
    >
      <Box
        onClick={() => onToggle(subtask._id)}
        sx={{
          width: 18,
          height: 18,
          borderRadius: 999,
          border: "1px solid",
          borderColor: subtask.isCompleted ? "success.main" : "divider",
          bgcolor: subtask.isCompleted ? "success.main" : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {subtask.isCompleted && <CheckCircleIcon sx={{ fontSize: 12, color: "#fff" }} />}
      </Box>

      <Typography
        variant="body2"
        sx={{
          flex: 1,
          textDecoration: subtask.isCompleted ? "line-through" : "none",
          color: subtask.isCompleted ? "text.disabled" : "text.primary",
        }}
      >
        {subtask.title}
      </Typography>

      {subtask.isCompleted && subtask.completedBy && (
        <Tooltip title={`Done by ${subtask.completedBy.name}`}>
          <Avatar sx={{ width: 18, height: 18, fontSize: 9 }}>
            {subtask.completedBy.name?.[0]}
          </Avatar>
        </Tooltip>
      )}

      <IconButton
        size="small"
        className="delete-btn"
        onClick={() => onDelete(subtask._id)}
        sx={{ opacity: 0, transition: "opacity 0.2s", color: "error.main", p: 0.3 }}
      >
        <DeleteIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Stack>
  );
}

function CommentItem({ comment, onDelete, myUserId }) {
  const isOwn = String(comment.user?._id || comment.user?.id) === String(myUserId);

  return (
    <Stack direction="row" spacing={1.5} sx={{ "&:hover .del-btn": { opacity: 1 } }}>
      <Avatar sx={{ width: 30, height: 30, fontSize: 12, mt: 0.2 }}>
        {comment.user?.name?.[0] || "?"}
      </Avatar>
      <Box flex={1}>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Typography variant="caption" fontWeight={700}>
            {comment.user?.name || "Unknown"}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {new Date(comment.createdAt).toLocaleString()}
          </Typography>
          {isOwn && (
            <IconButton
              size="small"
              className="del-btn"
              onClick={() => onDelete(comment._id)}
              sx={{ opacity: 0, transition: "opacity 0.2s", p: 0.3, color: "error.main" }}
            >
              <DeleteIcon sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.3, lineHeight: 1.6 }}>
          {comment.content}
        </Typography>
      </Box>
    </Stack>
  );
}

function TimelineEntry({ entry }) {
  const isCurrent = !entry.exitedAt;
  const durationLabel = formatDuration(entry.enteredAt, entry.exitedAt);
  const dotColor = entry.wasDelayed ? "error.main" : isCurrent ? "primary.main" : "success.main";

  return (
    <Stack direction="row" spacing={1.5} sx={{ py: 1 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 0.25 }}>
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: dotColor,
            boxShadow: isCurrent ? "0 0 0 4px rgba(25,118,210,0.08)" : "none",
          }}
        />
        <Box sx={{ width: 1, flex: 1, bgcolor: "divider", mt: 0.5 }} />
      </Box>

      <Box sx={{ pb: 1.5, flex: 1 }}>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          {entry.fromStage ? (
            <Chip size="small" label={entry.fromStage.name} variant="outlined" />
          ) : (
            <Chip size="small" label="Created" color="info" variant="outlined" />
          )}
          <ArrowForwardIcon sx={{ fontSize: 14, color: "text.disabled" }} />
          <Chip
            size="small"
            label={entry.toStage?.name || "Unknown"}
            color={entry.wasDelayed ? "error" : isCurrent ? "primary" : "success"}
            variant={isCurrent ? "filled" : "outlined"}
          />
          {entry.wasDelayed && <Chip size="small" label="Delayed" color="error" />}
          {isCurrent && <Chip size="small" label="Current" color="primary" variant="outlined" />}
        </Stack>

        <Stack direction="row" spacing={1.5} mt={0.75} flexWrap="wrap" alignItems="center">
          <Typography variant="caption" color="text.secondary">
            {new Date(entry.enteredAt).toLocaleString()}
          </Typography>
          <Chip
            size="small"
            label={durationLabel}
            sx={{
              height: 20,
              fontSize: 10,
              bgcolor: entry.wasDelayed ? "error.light" : "action.hover",
              color: entry.wasDelayed ? "error.main" : "text.secondary",
            }}
          />
          {entry.triggeredBy && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Avatar sx={{ width: 16, height: 16, fontSize: 8 }}>
                {entry.triggeredBy.name?.[0] || "?"}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                {entry.triggeredBy.name}
              </Typography>
            </Stack>
          )}
        </Stack>

        {entry.comment && (
          <Typography variant="caption" color="text.secondary" fontStyle="italic" display="block" mt={0.4}>
            {entry.comment}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function TaskView() {
  const { taskId } = useParams();
  const { _id: projectId, memberships = [] } = useSelector((state) => state.project);
  const workspaceState = useSelector((state) => state.workspace);
  const currentUser = normalizeCurrentUser(useSelector((state) => state.auth?.data));

  const [data, setData] = useState(null);
  const [transitions, setTransitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [transitionComment, setTransitionComment] = useState("");
  const [newSubtask, setNewSubtask] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [advancingTransitionId, setAdvancingTransitionId] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);

  const commentEndRef = useRef(null);
  const previousCurrentStageIdRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!taskId) return;

    setLoading(true);
    try {
      const [detailRes, transitionsRes] = await Promise.all([
        callApi({ method: "get", url: `/tasks/${taskId}/detail` }),
        callApi({ method: "get", url: `/tasks/${taskId}/transitions` }),
      ]);

      if (detailRes.success) {
        setData(detailRes.data.data);
      }

      if (transitionsRes.success) {
        setTransitions(transitionsRes.data.data || []);
      } else {
        setTransitions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.comments]);

  const task = data?.task || null;
  const comments = data?.comments || [];
  const stateHistory = data?.stateHistory || [];
  const subtasks = data?.subtasks || [];

  const currentStage = task?.currentStageId || null;
  const currentStageId = getId(currentStage);

  const projectRoleIds = useMemo(() => {
    const member = memberships.find((entry) => {
      const memberUserId = entry?.user?._id || entry?.user?.id || entry?.user;
      return String(memberUserId) === String(currentUser?._id || currentUser?.id);
    });

    return (member?.roles || [])
      .map((role) => String(role?._id || role?.id || role))
      .filter(Boolean);
  }, [memberships, currentUser]);

  const isWorkspaceAdmin = ["admin", "owner"].includes(String(workspaceState?.role || "").toLowerCase());

  const stageOptions = useMemo(() => {
    const options = [];
    if (currentStage) {
      options.push({
        id: String(currentStageId),
        label: currentStage.name,
        kind: "current",
        stage: currentStage,
        transition: null,
      });
    }

    transitions.forEach((transition) => {
      const stageId = getId(transition.toStage);
      if (!stageId) return;
      if (options.some((option) => option.id === String(stageId))) return;

      options.push({
        id: String(stageId),
        label: transition.toStage?.name || "Unknown",
        kind: "transition",
        stage: transition.toStage,
        transition,
      });
    });

    return options;
  }, [currentStage, currentStageId, transitions]);

  useEffect(() => {
    const currentId = currentStageId ? String(currentStageId) : null;

    if (currentId && previousCurrentStageIdRef.current !== currentId) {
      setSelectedStageId(currentId);
    } else if (!currentId && !selectedStageId && stageOptions.length > 0) {
      setSelectedStageId(stageOptions[0].id);
    }

    previousCurrentStageIdRef.current = currentId;
  }, [currentStageId, selectedStageId, stageOptions]);

  const selectedStage = stageOptions.find((option) => option.id === selectedStageId) || stageOptions[0] || null;

  const doneCount = subtasks.filter((subtask) => subtask.isCompleted).length;
  const subtaskProgress = subtasks.length > 0 ? (doneCount / subtasks.length) * 100 : 0;

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSavingComment(true);
    try {
      const res = await callApi({
        method: "post",
        url: `/tasks/${taskId}/comments`,
        data: { projectId, content: newComment.trim() },
      });

      if (res.success) {
        setNewComment("");
        fetchData();
      }
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    await callApi({ method: "delete", url: `/tasks/comments/${commentId}` });
    fetchData();
  };

  const handleAddSubtask = async () => {
    if (!newSubtask.trim()) return;

    await callApi({
      method: "post",
      url: `/tasks/${taskId}/subtasks`,
      data: { title: newSubtask.trim(), workflowStageId: currentStageId || null },
    });

    setNewSubtask("");
    setAddingSubtask(false);
    fetchData();
  };

  const handleToggleSubtask = async (subtaskId) => {
    await callApi({ method: "patch", url: `/tasks/subtasks/${subtaskId}/toggle` });
    fetchData();
  };

  const handleDeleteSubtask = async (subtaskId) => {
    await callApi({ method: "delete", url: `/tasks/subtasks/${subtaskId}` });
    fetchData();
  };

  const handleAdvanceTransition = async (transition) => {
    const canUseTransition =
      isWorkspaceAdmin ||
      (transition.allowedRoles || []).length === 0 ||
      (transition.allowedRoles || []).some((role) =>
        projectRoleIds.includes(String(role?._id || role?.id || role))
      );

    if (!canUseTransition) return;

    setAdvancingTransitionId(transition._id);
    try {
      const res = await callApi({
        method: "post",
        url: `/tasks/${taskId}/advance`,
        data: {
          transitionId: transition._id,
          comment: transitionComment.trim() || undefined,
        },
      });

      if (res.success) {
        setTransitionComment("");
        fetchData();
      }
    } finally {
      setAdvancingTransitionId(null);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (!data || !task) {
    return (
      <Box p={4}>
        <Alert severity="error">Task not found</Alert>
      </Box>
    );
  }

  const accentColor = task.categoryId?.color || "#1976d2";
  const priorityMeta = PRIORITY_META[task.priority] || PRIORITY_META.MEDIUM;

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        minHeight: 0,
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          flex: "0 0 45%",
          minWidth: 360,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: `linear-gradient(135deg, ${accentColor}18 0%, transparent 100%)`,
          }}
        >
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box flex={1}>
              {task.categoryId && (
                <Chip
                  size="small"
                  label={task.categoryId.name}
                  sx={{
                    mb: 1,
                    bgcolor: `${accentColor}18`,
                    color: accentColor,
                    fontWeight: 700,
                    fontSize: 11,
                    border: `1px solid ${accentColor}44`,
                  }}
                />
              )}

              <Typography variant="h5" fontWeight={800} lineHeight={1.25}>
                {task.title}
              </Typography>

              <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                <Chip
                  size="small"
                  icon={<FlagIcon sx={{ fontSize: "13px !important" }} />}
                  label={priorityMeta.label}
                  color={priorityMeta.color}
                  variant="outlined"
                />
                {task.isBlocked && (
                  <Chip size="small" label={`Blocked: ${task.blockedReason || "No reason"}`} color="error" />
                )}
                {task.deadline && (
                  <Chip
                    size="small"
                    label={`Due ${new Date(task.deadline).toLocaleDateString()}`}
                    color={new Date(task.deadline) < new Date() && !currentStage?.isEnd ? "error" : "default"}
                    variant="outlined"
                  />
                )}
              </Stack>
            </Box>

            <Tooltip title={task.isBlocked ? "Unblock task" : "Block task"}>
              <IconButton
                onClick={() => setBlockOpen(true)}
                color={task.isBlocked ? "success" : "warning"}
                size="small"
              >
                {task.isBlocked ? <CheckCircleIcon /> : <BlockIcon />}
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            px: 3,
            py: 2.5,
            display: "flex",
            flexDirection: "column",
            gap: 3,
          }}
        >
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={700}>
              Description
            </Typography>
            <Typography
              variant="body2"
              color={task.description ? "text.primary" : "text.disabled"}
              mt={0.5}
              lineHeight={1.8}
            >
              {task.description || "No description provided."}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
              <Typography variant="overline" color="text.secondary" fontWeight={700}>
                Subtasks {subtasks.length > 0 ? `(${doneCount}/${subtasks.length})` : ""}
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setAddingSubtask((value) => !value)}
                sx={{ textTransform: "none", fontSize: 12 }}
              >
                Add
              </Button>
            </Stack>

            {subtasks.length > 0 && (
              <Box mb={1}>
                <LinearProgress
                  variant="determinate"
                  value={subtaskProgress}
                  sx={{ height: 4, borderRadius: 2 }}
                  color={subtaskProgress === 100 ? "success" : "primary"}
                />
              </Box>
            )}

            <Stack spacing={0.5}>
              {subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask._id}
                  subtask={subtask}
                  onToggle={handleToggleSubtask}
                  onDelete={handleDeleteSubtask}
                />
              ))}
            </Stack>

            {addingSubtask && (
              <Stack direction="row" spacing={1} mt={1}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="New subtask title..."
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                  autoFocus
                />
                <Button variant="contained" size="small" onClick={handleAddSubtask} sx={{ whiteSpace: "nowrap" }}>
                  Add
                </Button>
                <Button size="small" onClick={() => setAddingSubtask(false)}>
                  Cancel
                </Button>
              </Stack>
            )}

            {subtasks.length === 0 && !addingSubtask && (
              <Typography variant="caption" color="text.disabled">
                No subtasks yet. Add one to track progress.
              </Typography>
            )}
          </Box>

          <Divider />

          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={700} display="block" mb={1}>
              Details
            </Typography>
            <Stack spacing={1.1}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Created by
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Avatar sx={{ width: 18, height: 18, fontSize: 9 }}>
                    {task.createdBy?.name?.[0] || "?"}
                  </Avatar>
                  <Typography variant="caption" fontWeight={600}>
                    {task.createdBy?.name || "Unknown"}
                  </Typography>
                </Stack>
              </Stack>

              {task.workflowId && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Workflow
                  </Typography>
                  <Chip size="small" label={`${task.workflowId.name} V${task.workflowId.version}`} variant="outlined" />
                </Stack>
              )}

              <Box>
                <Stack direction="row" spacing={0.5} alignItems="center" mb={0.5}>
                  <ShieldIcon sx={{ fontSize: 14, color: "primary.main" }} />
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Authorized Roles
                  </Typography>
                </Stack>
                <StageRoleChips roles={data.allowedRoles || []} />
              </Box>

              {task.assignees?.length > 0 && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Assignees
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {task.assignees.map((assignee) => (
                      <Tooltip key={assignee._id} title={assignee.name}>
                        <Avatar sx={{ width: 22, height: 22, fontSize: 10 }}>
                          {assignee.name?.[0] || "?"}
                        </Avatar>
                      </Tooltip>
                    ))}
                  </Stack>
                </Stack>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Box
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
            px: 2,
            py: 1.5,
            flexShrink: 0,
          }}
        >
          <Typography variant="overline" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
            Workflow Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {currentStage?.name || "No current stage"}
          </Typography>
        </Box>

        <Box sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "background.paper", flexShrink: 0 }}>
          <Tabs
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
            sx={{ minHeight: 40, px: 2 }}
            TabIndicatorProps={{ sx: { height: 2 } }}
          >
            <Tab
              label={
                <Box sx={{ fontSize: 13, fontWeight: 600 }}>
                  Stages & Transitions
                </Box>
              }
              sx={{ minHeight: 40, textTransform: "none" }}
            />
            <Tab
              label={
                <Badge badgeContent={comments.length} color="primary" max={99}>
                  <Box pr={1} sx={{ fontSize: 13, fontWeight: 600 }}>
                    Comments
                  </Box>
                </Badge>
              }
              sx={{ minHeight: 40, textTransform: "none" }}
            />
            <Tab
              label={
                <Badge badgeContent={stateHistory.length} color="default" max={99}>
                  <Box pr={1} sx={{ fontSize: 13, fontWeight: 600 }}>
                    Task Timeline
                  </Box>
                </Badge>
              }
              sx={{ minHeight: 40, textTransform: "none" }}
            />
          </Tabs>
        </Box>

        {activeTab === 0 && (
          <Box sx={{ flex: 1, overflowY: "auto", p: 2.5, display: "flex", flexDirection: "column", gap: 2.5 }}>
            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                    Current Stage
                  </Typography>
                  {currentStage ? (
                    <>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={1}>
                        <Chip label={currentStage.name} color="primary" />
                        {currentStage.isStart && <Chip label="Start" size="small" variant="outlined" />}
                        {currentStage.isEnd && <Chip label="End" size="small" color="success" variant="outlined" />}
                      </Stack>
                      <StageRoleChips
                        roles={currentStage.allowedRoles || []}
                        emptyLabel="No stage restriction"
                      />
                    </>
                  ) : (
                    <Typography variant="body2" color="text.disabled">
                      This task is not attached to a workflow stage yet.
                    </Typography>
                  )}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={700} display="block" mb={1}>
                    Stage Explorer
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {stageOptions.map((option) => (
                      <Chip
                        key={option.id}
                        label={option.kind === "current" ? `Current: ${option.label}` : option.label}
                        color={selectedStageId === option.id ? "primary" : "default"}
                        variant={selectedStageId === option.id ? "filled" : "outlined"}
                        onClick={() => setSelectedStageId(option.id)}
                        sx={{ cursor: "pointer" }}
                      />
                    ))}
                  </Stack>
                </Box>

                {selectedStage && (
                  <Card variant="outlined" sx={{ borderRadius: 2.5 }}>
                    <CardActionArea onClick={() => setSelectedStageId(selectedStage.id)} sx={{ p: 0 }}>
                      <CardContent sx={{ p: 2.25 }}>
                        <Stack spacing={1.25}>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                            <Typography variant="subtitle2" fontWeight={700}>
                              {selectedStage.kind === "current" ? "Current Stage Details" : "Transition Target"}
                            </Typography>
                            <Chip
                              size="small"
                              label={selectedStage.kind === "current" ? "Current" : "Next"}
                              color={selectedStage.kind === "current" ? "primary" : "default"}
                              variant="outlined"
                            />
                          </Stack>

                          <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                            {selectedStage.label}
                          </Typography>

                          <Typography variant="body2" color="text.secondary">
                            {selectedStage.kind === "current"
                              ? "This is the task's active stage."
                              : "This is one of the available next stages."}
                          </Typography>

                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.75}>
                              Allowed Roles
                            </Typography>
                            <StageRoleChips
                              roles={selectedStage.kind === "current"
                                ? (selectedStage.stage?.allowedRoles || [])
                                : (selectedStage.transition?.allowedRoles || [])}
                              emptyLabel="Open access"
                            />
                          </Box>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                )}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={700} display="block" mb={0.5}>
                    Next Transitions
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Choose the next workflow step. Comments are optional and will be stored with the transition.
                  </Typography>
                </Box>

                {transitions.length === 0 ? (
                  <Alert severity="info">No next transitions are available from the current stage.</Alert>
                ) : (
                  <Stack spacing={1}>
                    {transitions.map((transition) => {
                      const canUseTransition =
                        isWorkspaceAdmin ||
                        (transition.allowedRoles || []).length === 0 ||
                        (transition.allowedRoles || []).some((role) =>
                          projectRoleIds.includes(String(role?._id || role?.id || role))
                        );

                      return (
                        <Paper
                          key={transition._id}
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            borderColor: canUseTransition ? "divider" : "error.light",
                            bgcolor: canUseTransition ? "background.paper" : "error.lighter",
                          }}
                        >
                          <Stack spacing={1}>
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                <Chip size="small" label={transition.action || "Move"} variant="outlined" />
                                <ArrowForwardIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                                <Chip size="small" label={transition.toStage?.name || "Unknown"} color="primary" />
                                {transition.toStage?.isEnd && <Chip size="small" label="End" color="success" variant="outlined" />}
                              </Stack>

                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleAdvanceTransition(transition)}
                                disabled={!canUseTransition || advancingTransitionId === transition._id || task.isBlocked}
                                startIcon={
                                  advancingTransitionId === transition._id ? (
                                    <CircularProgress size={14} color="inherit" />
                                  ) : (
                                    <SendIcon sx={{ fontSize: 15 }} />
                                  )
                                }
                              >
                                Advance
                              </Button>
                            </Stack>

                            <StageRoleChips roles={transition.allowedRoles || []} emptyLabel="Open to all roles" />
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                )}

                <TextField
                  label="Transition comment"
                  placeholder="Optional note for this state change"
                  value={transitionComment}
                  onChange={(e) => setTransitionComment(e.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                />
              </Stack>
            </Paper>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                px: 3,
                py: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {comments.length === 0 ? (
                <Typography variant="body2" color="text.disabled" textAlign="center" mt={4}>
                  No comments yet. Be the first to comment.
                </Typography>
              ) : (
                comments.map((comment) => (
                  <CommentItem
                    key={comment._id}
                    comment={comment}
                    onDelete={handleDeleteComment}
                    myUserId={currentUser?._id || currentUser?.id}
                  />
                ))
              )}
              <div ref={commentEndRef} />
            </Box>

            <Box
              sx={{
                px: 3,
                pb: 2.5,
                pt: 1.5,
                borderTop: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                flexShrink: 0,
              }}
            >
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={4}
                  size="small"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                      handleAddComment();
                    }
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
                <Tooltip title="Send (Ctrl+Enter)">
                  <IconButton
                    color="primary"
                    onClick={handleAddComment}
                    disabled={!newComment.trim() || savingComment}
                    sx={{
                      alignSelf: "flex-end",
                      bgcolor: "primary.main",
                      color: "#fff",
                      borderRadius: 2,
                      "&:hover": { bgcolor: "primary.dark" },
                      "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
                    }}
                  >
                    {savingComment ? <CircularProgress size={18} color="inherit" /> : <SendIcon sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
                Ctrl+Enter to send
              </Typography>
            </Box>
          </Box>
        )}

        {activeTab === 2 && (
          <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2.5 }}>
            {stateHistory.length === 0 ? (
              <Typography variant="body2" color="text.disabled" textAlign="center" mt={4}>
                No stage transitions recorded yet.
              </Typography>
            ) : (
              stateHistory.map((entry) => <TimelineEntry key={entry._id} entry={entry} />)
            )}
          </Box>
        )}
      </Box>

      <BlockTaskDialog
        open={blockOpen}
        task={task}
        onClose={() => setBlockOpen(false)}
        onBlocked={() => fetchData()}
      />
    </Box>
  );
}

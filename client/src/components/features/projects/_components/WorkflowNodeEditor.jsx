import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  TextField,
  Stack,
  Button,
  Chip,
  MenuItem,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggestOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { createEdge, deleteEdge, deleteNode, updateNode, updateEdge } from "../../../../redux/slices/workflowSlice";
import { callApi } from "../../../../api/api";

export default function WorkflowNodeEditor() {
  const dispatch = useDispatch();
  const { nodes, edges, selectedNode, isEditable } = useSelector((state) => state.workflow);
  const { _id: projectId } = useSelector((state) => state.project);

  const [label, setLabel] = useState("");
  const [allowedRoles, setAllowedRoles] = useState([]);
  const [isStart, setIsStart] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [targetStage, setTargetStage] = useState("");
  const [projectRoles, setProjectRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);

  useEffect(() => {
    if (!selectedNode) return;

    const timer = window.setTimeout(() => {
      setLabel(selectedNode.data.label || "");
      setAllowedRoles(selectedNode.data.allowedRoles || []);
      setIsStart(selectedNode.data.isStart || false);
      setIsEnd(selectedNode.data.isEnd || false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [selectedNode]);

  useEffect(() => {
    const fetchRoles = async () => {
      setLoadingRoles(true);
      if (projectId) {
        const res = await callApi({
          method: "get",
          url: `/projects/${projectId}/roles`,
        });
        if (res.success) {
          setProjectRoles(res.data.roles || []);
        } else {
          console.error("Failed to fetch roles");
        }
      }
      setLoadingRoles(false);
    };

    fetchRoles();
  }, [projectId]);

  if (!selectedNode) return null;

  const open = Boolean(anchorEl);
  const connectedEdges = edges.filter((e) => e.source === selectedNode.id);
  const connectedNodes = connectedEdges.map((e) => nodes.find((n) => n.id === e.target));
  const incomingEdges = edges.filter((e) => e.target === selectedNode.id);
  const incomingNodes = incomingEdges.map((e) => nodes.find((n) => n.id === e.source));

  const handleUpdate = (updates) => {
    dispatch(updateNode({ ...selectedNode, data: { ...selectedNode.data, ...updates } }));
  };
  return (
    <>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: "action.hover",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
          <Typography variant="subtitle2" fontWeight={700}>
            {selectedNode.data.label || "Untitled Stage"}
          </Typography>
          {isStart && <Chip label="Start" size="small" color="success" variant="outlined" />}
          {isEnd && <Chip label="End" size="small" color="primary" variant="outlined" />}
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
          {isEnd
            ? "This is an end stage. It will not have outgoing transitions."
            : "Edit the stage details, allowed roles, and outgoing transitions below."}
        </Typography>
      </Box>

      <TextField
        fullWidth
        label="Stage Name"
        disabled={!isEditable}
        value={label}
        onChange={(e) => {
          const value = e.target.value;
          setLabel(value);
          handleUpdate({ label: value });
        }}
        sx={{ mt: 2 }}
      />

      <Button
        startIcon={<SettingsSuggestIcon />}
        variant="contained"
        fullWidth
        disabled={!isEditable}
        sx={{ mt: 2 }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Configure Actions
      </Button>

      <Dialog
        open={open}
        onClose={() => setAnchorEl(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle2">Configure Edge Actions</Typography>
          <IconButton
            onClick={() => setAnchorEl(null)}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <Stack spacing={2}>
            {connectedEdges.map((edge) => {
              const targetNode = nodes.find((n) => n.id === edge.target);
              const actionValue = edge.data?.action || "";
              const hasAction = actionValue.trim().length > 0;
              
              return (
                <Stack key={edge.id} direction="row" alignItems="center" spacing={1.5}>
                  <TextField
                    size="small"
                    placeholder="Action"
                    disabled={!isEditable}
                    value={actionValue}
                    onChange={(e) => {
                      dispatch(updateEdge({
                        ...edge,
                        data: {
                          ...edge.data,
                          action: e.target.value
                        }
                      }));
                    }}
                    sx={{ width: 110 }}
                    inputProps={{ style: { fontSize: '0.8rem', padding: '6px 8px' } }}
                  />
                  <ArrowRightAltIcon color="action" fontSize="small" />
                  <Typography sx={{ flex: 1, fontWeight: 500, fontSize: '0.85rem' }}>{targetNode?.data?.label}</Typography>
                  {hasAction ? (
                    <CheckCircleIcon color="success" fontSize="small" />
                  ) : (
                    <RadioButtonUncheckedIcon color="action" fontSize="small" />
                  )}
                </Stack>
              );
            })}
            {connectedEdges.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                {isEnd ? "No outgoing transitions from an end stage." : "No connected stages found."}
              </Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Connected Stages */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">Outgoing Transitions</Typography>

        <Stack spacing={1} sx={{ mt: 1 }}>
          {connectedNodes.map((n, i) => {
            const edge = connectedEdges[i];

            return (
              <Chip
                key={n.id}
                label={`${edge?.data?.action || "No Action"} → ${n?.data?.label}`}
                onClick={(e) => {
                  setTargetStage(n.id);
                  setAnchorEl(e.currentTarget);
                }}
                onDelete={isEditable ? () => {
                  dispatch(deleteEdge(edge.id));
                } : undefined}
              />
            );
          })}
        </Stack>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">Incoming From</Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          {incomingNodes.filter(Boolean).length > 0 ? (
            incomingNodes.map((n, i) => {
              const edge = incomingEdges[i];
              if (!n) return null;

              return (
                <Chip
                  key={edge?.id || n.id}
                  label={`${n.data?.label || "Unknown"} → ${edge?.data?.action || "No Action"}`}
                  variant="outlined"
                  size="small"
                />
              );
            })
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {isStart ? "No incoming transitions on the start stage." : "No incoming transitions found."}
            </Typography>
          )}
        </Stack>
      </Box>

      {isEditable && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Connect New Stage</Typography>

          <TextField
            select
            fullWidth
            label="Select Stage"
            value={targetStage}
            onChange={(e) => setTargetStage(e.target.value)}
            sx={{ mt: 1 }}
          >
            <MenuItem value="" disabled>
              Select a stage to connect...
            </MenuItem>
            {nodes
              ?.filter((n) => n.id !== selectedNode.id && !connectedEdges.some((e) => e.target === n.id))
              .map((n) => (
                <MenuItem key={n.id} value={n.id}>
                  {n.data.label}
                </MenuItem>
              ))}
          </TextField>

          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 1 }}
            onClick={() => {
              if (!targetStage) return;
              dispatch(createEdge({ source: selectedNode.id, target: targetStage }));
              setTargetStage("");
            }}
          >
            Connect
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">Allowed Roles</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, rowGap: 1 }}>
          {allowedRoles.length === 0 && (
            <Chip label="All Roles Allowed" color="success" variant="outlined" />
          )}
          {allowedRoles.map((roleId) => {
            const role = projectRoles.find((r) => r._id === roleId);
            return (
              <Chip
                key={roleId}
                label={role?.name || roleId}
                onDelete={isEditable ? () => {
                  const newRoles = allowedRoles.filter((r) => r !== roleId);
                  setAllowedRoles(newRoles);
                  handleUpdate({ allowedRoles: newRoles });
                } : undefined}
              />
            );
          })}
        </Stack>

        <TextField
          select
          fullWidth
          label="Add Role"
          disabled={!isEditable}
          sx={{ mt: 1 }}
          value=""
          onChange={(e) => {
            const value = e.target.value;
            if (!allowedRoles.includes(value)) {
              const newRoles = [...allowedRoles, value];
              setAllowedRoles(newRoles);
              handleUpdate({ allowedRoles: newRoles });
            }
          }}
        >
          <MenuItem disabled value="">
            {loadingRoles ? "Loading..." : "Select Role"}
          </MenuItem>

          {projectRoles.map((role) => (
            <MenuItem key={role._id} value={role._id}>
              {role.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Flags */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isStart}
              disabled={!isEditable}
              onChange={(e) => {
                setIsStart(e.target.checked);
                handleUpdate({ isStart: e.target.checked });
              }}
            />
          }
          label="Start"
        />

        <FormControlLabel
          control={
            <Switch
              checked={isEnd}
              disabled={!isEditable}
              onChange={(e) => {
                setIsEnd(e.target.checked);
                handleUpdate({ isEnd: e.target.checked });
              }}
            />
          }
          label="End"
        />
      </Stack>



      {isEditable && (
        <Button
          sx={{ mt: 1 }}
          color="error"
          onClick={() => dispatch(deleteNode(selectedNode.id))}
        >
          Delete
        </Button>
      )}
    </>
  );
}

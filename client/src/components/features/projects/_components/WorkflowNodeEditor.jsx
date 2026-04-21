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
} from "@mui/material";

export default function WorkflowNodeEditor({
  node,
  nodes,
  label,
  setLabel,
  allowedRoles,
  setAllowedRoles,
  projectRoles,
  loadingRoles,
  isStart,
  setIsStart,
  isEnd,
  setIsEnd,
  stageActions,
  connectedNodes,
  connectedEdges,
  targetStage,
  setTargetStage,
  setAnchorEl,
  setNewAction,
  workflowActions,
  onUpdateNode,
  onDeleteNode,
}) {
  return (
    <>
      <Typography variant="body2">Workflow Stage</Typography>

      <TextField
        fullWidth
        label="Stage Name"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        sx={{ mt: 2 }}
      />

      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        Configure Actions
      </Button>

      {/* Connected Stages */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">Connected Stages</Typography>

        <Stack spacing={1} sx={{ mt: 1 }}>
          {connectedNodes.map((n, i) => {
            const edge = connectedEdges[i];

            return (
              <Chip
                key={n.id}
                label={`${edge?.data?.action || "No Action"} → ${n?.data?.label}`}
                onClick={() => {
                  setTargetStage(n.id);
                  setNewAction(edge?.data?.action || "");
                  setAnchorEl(true);
                }}
                onDelete={() => {
                  workflowActions.deleteEdge(edge.id);
                }}
              />
            );
          })}
        </Stack>
      </Box>

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
          {nodes
            ?.filter((n) => n.id !== node.id)
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

            workflowActions.createEdge({
              source: node.id,
              target: targetStage,
            });

            setTargetStage("");
          }}
        >
          Connect
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">Allowed Roles</Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, rowGap: 1 }}>
          {allowedRoles.map((roleId) => {
            const role = projectRoles.find((r) => r._id === roleId);
            return (
              <Chip
                key={roleId}
                label={role?.name || roleId}
                onDelete={() =>
                  setAllowedRoles((prev) =>
                    prev.filter((r) => r !== roleId)
                  )
                }
              />
            );
          })}
        </Stack>

        <TextField
          select
          fullWidth
          label="Add Role"
          sx={{ mt: 1 }}
          value=""
          onChange={(e) => {
            const value = e.target.value;
            if (!allowedRoles.includes(value)) {
              setAllowedRoles((prev) => [...prev, value]);
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
              onChange={(e) => setIsStart(e.target.checked)}
            />
          }
          label="Start"
        />

        <FormControlLabel
          control={
            <Switch
              checked={isEnd}
              onChange={(e) => setIsEnd(e.target.checked)}
            />
          }
          label="End"
        />
      </Stack>

      {/* Save */}
      <Button
        sx={{ mt: 2 }}
        variant="contained"
        onClick={() =>
          onUpdateNode({
            ...node,
            data: {
              ...node.data,
              label,
              actions: stageActions,
              allowedRoles,
              isStart,
              isEnd,
            },
          })
        }
      >
        Save
      </Button>

      <Button
        sx={{ mt: 1 }}
        color="error"
        onClick={() => onDeleteNode(node.id)}
      >
        Delete
      </Button>
    </>
  );
}
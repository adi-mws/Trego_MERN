import { Box, TextField, Typography, MenuItem,Chip, Divider, Tooltip, Button, Switch, Stack, IconButton } from "@mui/material";
import { useState, useEffect } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import AddIcon from "@mui/icons-material/AddOutlined"
import { FormControlLabel } from "@mui/material";
import { useSelector } from "react-redux"
import { callApi } from "../../../../api/api"
export default function WorkflowSidebar({
  node,
  edge,
  onUpdateNode,
  onUpdateEdge,
  onDeleteNode,
  onDeleteEdge,
  workflowActions
}) {
  const [label, setLabel] = useState("");
  const [requireComment, setRequireComment] = useState(false);
  const [stageActions, setStageActions] = useState([]);
  const [allowedRoles, setAllowedRoles] = useState([]);
  const [isStart, setIsStart] = useState(false);
  const [isEnd, setIsEnd] = useState(false);

  const [action, setAction] = useState(""); // for edge
  const [meta, setMeta] = useState({ color: "", icon: "" });

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || "");
      setStageActions(node.data.actions || []);
      setAllowedRoles(node.data.allowedRoles || []);
      setIsStart(node.data.isStart || false);
      setIsEnd(node.data.isEnd || false);
    } else if (edge) {
      setLabel(edge.label || "");
      setRequireComment(edge.data?.requireComment || false);
      setAction(edge.data?.action || "");
      setAllowedRoles(edge.data?.allowedRoles || []);
      setMeta(edge.data?.meta || {});
    }
  }, [node, edge]);



  const [projectRoles, setProjectRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const projectId = useSelector((state) => state.project._id);

  // Fetching the project roles dynamically
  useEffect(() => {
    const fetchRoles = async () => {
      if (projectId) {
        setLoadingRoles(true);

        const res = await callApi({
          method: "GET",
          url: `/projects/${projectId}/roles`, // adjust if needed
        });
        if (res.success) {
          setProjectRoles(res?.data?.roles || []);
        }
        else {
          console.error("Failed to fetch roles", res.error);
        }

        setLoadingRoles(false);
      };
    }

    fetchRoles();
  }, [projectId]);

  // if (!node && !edge) {
  //   return (
  //     <Box sx={{ width: 250, p: 2, borderLeft: "1px solid #ddd" }}>
  //       Select a node or edge
  //     </Box>
  //   );
  // }

  return (
    <Box sx={{ width: 300, p: 1, borderLeft: "1px solid #ddd" }}>
      {/* Controls */}
      <Typography variant="caption">Workflow Controls</Typography>

      <Stack spacing={1} direction={"row"}>

        {/* Row 1 */}
        <Stack direction="row" spacing={2} justifyContent={"center"} alignItems="center">
          <Tooltip title="Add Stage">
            <span><IconButton disabled><AddIcon sx={{ fontSize: 20 }} /></IconButton></span>
          </Tooltip>

          <Tooltip title="Delete Selected">
            <span><IconButton disabled><DeleteIcon sx={{ fontSize: 20 }} /></IconButton></span>
          </Tooltip>

          <Tooltip title="Recalculate Flow">
            <span><IconButton onClick={workflowActions.recalculateFlow}><AccountTreeIcon sx={{ fontSize: 20 }} /></IconButton></span>
          </Tooltip>

          <Tooltip title="Vertical Layout">
            <span><IconButton onClick={workflowActions.verticalView}><VerticalAlignTopIcon sx={{ fontSize: 20 }} /></IconButton></span>
          </Tooltip>

          <Tooltip title="Horizontal Layout">
            <span><IconButton onClick={workflowActions.horizontalView}><HorizontalRuleIcon sx={{ fontSize: 20 }} /></IconButton></span>
          </Tooltip>

          <Tooltip title="Center View">
            <span><IconButton onClick={workflowActions.centerView}><CenterFocusStrongIcon sx={{ fontSize: 20 }} /></IconButton></span>
          </Tooltip>


        </Stack>

      </Stack>
      <Divider sx={{ mb: 3, mt: 1 }} />
      {node && (
        <>
          <Typography variant="h6">Stage</Typography>

          {/* Stage Name */}
          <TextField
            fullWidth
            label="Stage Name"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* Actions */}
          <TextField
            fullWidth
            label="Actions (comma separated)"
            value={stageActions.join(", ")}
            onChange={(e) =>
              setStageActions(
                e.target.value.split(",").map((a) => a.trim())
              )
            }
            sx={{ mt: 2 }}
          />

          {/* Allowed Roles */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Allowed Roles</Typography>

            {/* Selected Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, rowGap: 1 }}>
              {allowedRoles.map((roleId) => {
                const role = projectRoles.find(r => r._id === roleId);
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

            {/* Dropdown Add */}
            <TextField
              select
              fullWidth
              label="Add Role"
              sx={{ mt: 1 }}
              SelectProps={{
                native: false,
              }}
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
      )}

      {edge && (
        <>
          <Typography variant="h6">Transition</Typography>

          {/* Label */}
          <TextField
            fullWidth
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* Action */}
          <TextField
            fullWidth
            label="Action (approve / reject)"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            sx={{ mt: 2 }}
          />

          {/* Allowed Roles */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Transition Color</Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
              {[
                "#21ce21", "#ff4d4f", "#1890ff", "#faad14",
                "#722ed1", "#13c2c2", "#eb2f96", "#fa541c",
                "#2f54eb", "#52c41a"
              ].map((color) => (
                <Box
                  key={color}
                  onClick={() =>
                    setMeta((prev) => ({ ...prev, color }))
                  }
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: color,
                    cursor: "pointer",
                    border: meta.color === color ? "2px solid #000" : "2px solid transparent",
                  }}
                />
              ))}

              {/* Custom Color */}
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border: "2px dashed #999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <input
                  type="color"
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                  }}
                  onChange={(e) =>
                    setMeta((prev) => ({
                      ...prev,
                      color: e.target.value,
                    }))
                  }
                />
              </Box>
            </Stack>
          </Box>

          {/* Require Comment */}
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={requireComment}
                  onChange={(e) => setRequireComment(e.target.checked)}
                />
              }
              label="Require Comment"
            />
          </Box>

          {/* Meta */}
          <TextField
            fullWidth
            label="Color"
            value={meta.color || ""}
            onChange={(e) =>
              setMeta((prev) => ({ ...prev, color: e.target.value }))
            }
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="Icon"
            value={meta.icon || ""}
            onChange={(e) =>
              setMeta((prev) => ({ ...prev, icon: e.target.value }))
            }
            sx={{ mt: 2 }}
          />

          {/* Save */}
          <Button
            sx={{ mt: 2 }}
            variant="contained"
            onClick={() =>
              onUpdateEdge({
                ...edge,
                label,
                data: {
                  ...edge.data,
                  action,
                  allowedRoles,
                  requireComment,
                  meta,
                },
              })
            }
          >
            Save
          </Button>

          <Button
            sx={{ mt: 1 }}
            color="error"
            onClick={() => onDeleteEdge(edge.id)}
          >
            Delete
          </Button>
        </>
      )}
    </Box>
  );
}
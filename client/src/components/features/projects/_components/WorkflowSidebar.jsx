import { Box, TextField, Typography, MenuItem, Popover, Chip, Divider, Tooltip, Button, Switch, Stack, IconButton } from "@mui/material";
import { useState, useEffect } from "react";

import DeleteIcon from "@mui/icons-material/Delete";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import HorizontalRuleIcon from "@mui/icons-material/HorizontalRule";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import AddIcon from "@mui/icons-material/AddOutlined"
import { useSelector } from "react-redux"
import { callApi } from "../../../../api/api"
import WorkflowNodesNotSelected from "./WorkflowNodesNotSelected";
import WorkflowSidebarHeader from "./WorkflowSIdebarHeader";
import WorkflowEdgeEditor from "./WorkflowEdgeEditor";
import WorkflowNodeEditor from "./WorkflowNodeEditor";
export default function WorkflowSidebar({
  node,
  nodes,
  edge,
  edges,
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

  const [anchorEl, setAnchorEl] = useState(null);
  const [newAction, setNewAction] = useState("");
  const [targetStage, setTargetStage] = useState("");

  const open = Boolean(anchorEl);

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


  const connectedTargetIds = edges
    ?.filter((e) => e.source === node?.id)
    .map((e) => e.target);

  const connectedEdges = edges?.filter(
    (e) => e.source === node?.id
  );

  const connectedNodes = connectedEdges.map((e) =>
    nodes.find((n) => n.id === e.target)
  );



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

      {/* Controls */}

      <WorkflowSidebarHeader workflowName={"Development Workflow"} />


      {/* Workflow Controls */}
      <Stack spacing={1} px={1} direction={"row"}>

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


      <Divider sx={{ my: 1 }} />

      {/* Workflow Sidebar Main Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          minHeight: 0,
        }}>
        {(!node && !edge) ?
          (
            <WorkflowNodesNotSelected />
          ) :

          node && (
            <WorkflowNodeEditor
              node={node}
              nodes={nodes}
              label={label}
              setLabel={setLabel}
              allowedRoles={allowedRoles}
              setAllowedRoles={setAllowedRoles}
              projectRoles={projectRoles}
              loadingRoles={loadingRoles}
              isStart={isStart}
              setIsStart={setIsStart}
              isEnd={isEnd}
              setIsEnd={setIsEnd}
              stageActions={stageActions}
              connectedNodes={connectedNodes}
              connectedEdges={connectedEdges}
              targetStage={targetStage}
              setTargetStage={setTargetStage}
              setAnchorEl={setAnchorEl}
              setNewAction={setNewAction}
              workflowActions={workflowActions}
              onUpdateNode={onUpdateNode}
              onDeleteNode={onDeleteNode}
            />
          )}

        {edge && (
          <WorkflowEdgeEditor
            edge={edge}
            label={label}
            setLabel={setLabel}
            action={action}
            setAction={setAction}
            meta={meta}
            setMeta={setMeta}
            requireComment={requireComment}
            setRequireComment={setRequireComment}
            allowedRoles={allowedRoles}
            onUpdateEdge={onUpdateEdge}
            onDeleteEdge={onDeleteEdge}
          />
        )}


        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <Box sx={{ p: 2, width: 300 }}>
            <Typography variant="subtitle2">
              Configure Actions
            </Typography>

            {/* FROM STAGE */}
            <TextField
              fullWidth
              label="From Stage"
              value={node?.data?.label || ""}
              disabled
              sx={{ mt: 2 }}
            />

            {/* ACTION INPUT */}
            <TextField
              fullWidth
              label="Action"
              value={newAction}
              onChange={(e) => setNewAction(e.target.value)}
              sx={{ mt: 2 }}
            />

            {/* TO STAGE */}
            <TextField
              select
              fullWidth
              label="To Stage"
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              sx={{ mt: 2 }}
            >
              {nodes
                ?.filter((n) => connectedTargetIds.includes(n.id))
                .map((n) => (
                  <MenuItem key={n.id} value={n.id}>
                    {n.data.label}
                  </MenuItem>
                ))}
            </TextField>
            {/* ADD BUTTON */}
            <Button
              fullWidth
              sx={{ mt: 2 }}
              variant="contained"
              onClick={() => {
                if (!newAction || !targetStage) return;

                // add to stage actions (temporary logic)
                if (!stageActions.includes(newAction)) {
                  setStageActions((prev) => [...prev, newAction]);
                }

                // later: create transition here

                setNewAction("");
                setTargetStage("");
              }}
            >
              Add Action
            </Button>

            {/* EXISTING ACTIONS */}
            <Stack spacing={1} sx={{ mt: 2 }}>
              {stageActions.map((act) => (
                <Chip
                  key={act}
                  label={act}
                  onDelete={() =>
                    setStageActions((prev) =>
                      prev.filter((a) => a !== act)
                    )
                  }
                />
              ))}
            </Stack>
          </Box>
        </Popover>
      </Box>

    </Box>
  );
}
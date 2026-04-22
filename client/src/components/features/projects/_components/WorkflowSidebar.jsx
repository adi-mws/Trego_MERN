import { Box, TextField, Typography, MenuItem, Popover, Chip, Divider, Tooltip, Button, Switch, Stack, IconButton } from "@mui/material";
import { useState, useEffect } from "react";


import { useDispatch, useSelector } from "react-redux"
import { callApi } from "../../../../api/api"
import WorkflowNodesNotSelected from "./WorkflowNodesNotSelected";
import WorkflowSidebarHeader from "./WorkflowSIdebarHeader";
import WorkflowEdgeEditor from "./WorkflowEdgeEditor";
import WorkflowNodeEditor from "./WorkflowNodeEditor";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { updateEdge, updateNode, deleteEdge, deleteNode, setEdges, setNodes } from "../../../../redux/slices/workflowSlice";
export default function WorkflowSidebar({
  workflowActions
}) {
  const { node, edges, selectedEdge, selectedNode } = useSelector((state) => state.workflow);

  const [label, setLabel] = useState("");
  const [requireComment, setRequireComment] = useState(false);
  const [stageActions, setStageActions] = useState([]);
  const [allowedRoles, setAllowedRoles] = useState([]);
  const [isStart, setIsStart] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const dispatch = useDispatch();
  const [action, setAction] = useState(""); // for edge
  const [meta, setMeta] = useState({ color: "", icon: "" });

  const [anchorEl, setAnchorEl] = useState(null);
  const [newAction, setNewAction] = useState("");
  const [targetStage, setTargetStage] = useState("");

  const open = Boolean(anchorEl);

  useEffect(() => {
    if (selectedNode) {
      setLabel(selectedNode.data.label || "");
      setStageActions(selectedNode.data.actions || []);
      setAllowedRoles(selectedNode.data.allowedRoles || []);
      setIsStart(selectedNode.data.isStart || false);
      setIsEnd(selectedNode.data.isEnd || false);
    } else if (selectedEdge) {
      setLabel(selectedEdge.label || "");
      setRequireComment(selectedEdge.data?.requireComment || false);
      setAction(selectedEdge.data?.action || "");
      setAllowedRoles(selectedEdge.data?.allowedRoles || []);
      setMeta(selectedEdge.data?.meta || {});
    }
  }, [selectedEdge, selectedNode]);



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
    ?.filter((e) => e.source === selectedNode?.id)
    .map((e) => e.target);

  const connectedEdges = edges?.filter(
    (e) => e.source === selectedNode?.id
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
          onClose={() => setAnchorEl(null)}
          anchorReference="anchorPosition"
          anchorPosition={{
            top: window.innerHeight / 2,
            left: window.innerWidth / 2,
          }}
          transformOrigin={{
            vertical: "center",
            horizontal: "center",
          }}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: 3,
              width: 400,
            },
          }}
        >
          <Box sx={{ p: 2.5 }}>

            {/* HEADER */}
            <Typography variant="h6" sx={{ mb: 2 }}>
              Actions
            </Typography>

            {/* FROM STAGE (clean like before) */}
            <TextField
              fullWidth
              size="small"
              label="From Stage"
              onChange={() => {

              }}
              value={node?.data?.label || ""}
              disabled
            />

            {/* ACTION LIST */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Configure Transition Action
              </Typography>

              <Stack spacing={1.5}>
                {nodes
                  ?.filter((n) => connectedTargetIds.includes(n.id))
                  .map((n) => {
                    const existing = stageActions.find(
                      (a) => a.target === n.id
                    );

                    return (
                      <Box
                        key={n.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto 1fr auto",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        {/* ACTION INPUT */}
                        <TextField
                          size="small"
                          placeholder="action name"
                          value={existing?.name || ""}
                          onChange={(e) => {
                            const value = e.target.value;

                            setStageActions((prev) => {
                              const others = prev.filter(
                                (a) => a.target !== n.id
                              );

                              setEdges((prev) => prev.map((item) => {
                                if (item.source === node.id) {
                                  return {
                                    ...item,
                                    data: {
                                      ...item.data,
                                      action: value,
                                    }
                                  }
                                } else {
                                  return item;
                                }
                              }))

                              setNode((prev) => ({ ...prev, data: { ...prev.data, actions: [...prev.data.actions, value] } }))

                              setNodes((prev) => prev.map((item) => {
                                if (item.id === node.id) {
                                  return {
                                    ...item,
                                    data: {
                                      ...item.data,
                                      actions: [...item.data.actions, value],
                                    }
                                  }
                                } else {
                                  return node;
                                }
                              }))



                              return [
                                ...others,
                                { name: value, target: n.id },
                              ];
                            });
                          }}
                        />

                        {/* ARROW */}
                        <Typography variant="body2">→</Typography>

                        {/* TARGET */}
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          {n.data.label}
                        </Typography>

                        {/* STATUS ICON */}
                        {existing?.name ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: "success.main" }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ fontSize: 18, color: "text.disabled" }}
                          />
                        )}
                      </Box>
                    );
                  })}
              </Stack>
            </Box>
          </Box>
        </Popover>
      </Box>

    </Box>
  );
}